import { deleteViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/helpers";
import { EditCaseFormValues } from "@/lib/type";
import { supabase } from "../client";

/**
 * Update an existing case in Supabase with document handling
 */
export async function updateCase(formData: EditCaseFormValues, caseId: string) {
  // 1. Get session
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    throw new Error("No active session found");
  }

  const newUploads: { url: string; name: string; publicId: string }[] = [];

  // Collect publicIds to delete after successful update
  const publicIdsToDelete: string[] = [];

  try {
    // 2. Handle removed docs (collect publicIds for later deletion)
    formData.removedDocs?.forEach((doc) => {
      if (doc.isOldOne) {
        const publicId = extractPublicIdFromUrl(doc.url);
        if (publicId) {
          publicIdsToDelete.push(publicId);
        }
      }
    });

    // 3. Upload new/updated files
    for (const doc of formData.docs) {
      if (doc.file) {
        // Has a new file attached (either new doc or update)
        const baseName = doc.name.replace(/\.[^/.]+$/, "");
        const uploadRes = await uploadViaEdge(
          session.access_token,
          doc.file,
          baseName,
          `caretaker-portal/cases/${caseId}`
        );

        // Track new upload for rollback
        newUploads.push({
          name: doc.name,
          url: uploadRes.url,
          publicId: uploadRes.public_id,
        });

        // Update doc with new details
        doc.url = uploadRes.url;
      }
    }

    // 4. Prepare docs array to store (only { name, url })
    const finalDocs = formData.docs
      .filter((d) => d.url) // only keep docs that have URLs
      .map((d) => ({ name: d.name, url: d.url! }));

    // 5. Update case in Supabase
    const { error: caseError } = await supabase
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
        docs: finalDocs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);

    if (caseError) throw caseError;

    // 6. After successful update, delete old/removed files from Cloudinary
    for (const publicId of publicIdsToDelete) {
      try {
        await deleteViaEdge(session.access_token, publicId);
      } catch (e) {
        console.warn("Failed to delete file:", publicId, e);
      }
    }

    return { success: true, caseId };
  } catch (error) {
    // Rollback: delete newly uploaded docs if update fails
    try {
      for (const doc of newUploads) {
        await deleteViaEdge(session.access_token, doc.publicId);
      }
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  }
}
