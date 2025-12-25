import { deleteViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/helpers";
import { EditCaseFormValues } from "@/lib/type";
import { supabase } from "../client";

/**
 * Update an existing case in Supabase with document + case image handling
 */
export async function updateCase(formData: EditCaseFormValues, caseId: string) {
  // 1. Get session
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    throw new Error("No active session found");
  }

  // Rollback safety
  const newUploads: { publicId: string }[] = [];

  // Delete AFTER success
  const publicIdsToDelete: string[] = [];

  try {
    /* ─────────────────────────────
       CASE IMAGE (ADDED)
    ───────────────────────────── */

    let finalCaseImageUrl = formData.case_image ?? null;

    if (formData.caseImage) {
      const uploadRes = await uploadViaEdge(
        session.access_token,
        formData.caseImage,
        `case-image-${Date.now()}`,
        `needy-portal/cases/${caseId}`
      );

      finalCaseImageUrl = uploadRes.url;

      // rollback safety
      newUploads.push({ publicId: uploadRes.public_id });

      // mark old image for deletion
      if (formData.case_image) {
        const oldPublicId = extractPublicIdFromUrl(formData.case_image);
        if (oldPublicId) {
          publicIdsToDelete.push(oldPublicId);
        }
      }
    }

    /* ─────────────────────────────
       REMOVED DOCS
    ───────────────────────────── */

    formData.removedDocs?.forEach((doc) => {
      if (doc.isOldOne && doc.url) {
        const publicId = extractPublicIdFromUrl(doc.url);
        if (publicId) {
          publicIdsToDelete.push(publicId);
        }
      }
    });

    /* ─────────────────────────────
       DOC UPLOADS
    ───────────────────────────── */

    for (const doc of formData.docs) {
      if (doc.file) {
        const baseName = doc.name.replace(/\.[^/.]+$/, "");

        const uploadRes = await uploadViaEdge(
          session.access_token,
          doc.file,
          baseName,
          `needy-portal/cases/${caseId}`
        );

        newUploads.push({ publicId: uploadRes.public_id });

        doc.url = uploadRes.url;
      }
    }

    /* ─────────────────────────────
       FINAL DOC PAYLOAD
    ───────────────────────────── */

    const finalDocs = formData.docs
      .filter((d) => d.url)
      .map((d) => ({
        name: d.name,
        url: d.url!,
      }));

    /* ─────────────────────────────
       DB UPDATE
    ───────────────────────────── */

    const { error } = await supabase
      .from("cases")
      .update({
        name: formData.name,
        cnic: formData.cnic,
        phone: formData.phone,
        address: formData.address,
        title: formData.title,
        short_story: formData.short_story,
        full_story: formData.full_story,
        category: formData.category,
        urgency_level: formData.urgency_level,
        required_amount: formData.required_amount,
        family_members: formData.family_members,
        is_recurring: formData.is_recurring,
        recurring_duration: formData.recurring_duration,
        location: formData.location,
        status: formData.status,

        case_image: finalCaseImageUrl, // ✅ ADDED

        docs: finalDocs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);

    if (error) throw error;

    /* ─────────────────────────────
       DELETE OLD FILES (POST SUCCESS)
    ───────────────────────────── */

    for (const publicId of publicIdsToDelete) {
      try {
        await deleteViaEdge(session.access_token, publicId);
      } catch (e) {
        console.warn("Failed to delete Cloudinary file:", publicId, e);
      }
    }

    return { success: true, caseId };
  } catch (error) {
    /* ─────────────────────────────
       ROLLBACK NEW UPLOADS
    ───────────────────────────── */

    try {
      for (const file of newUploads) {
        await deleteViaEdge(session.access_token, file.publicId);
      }
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  }
}
