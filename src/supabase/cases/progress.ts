import { deleteViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/helpers";
import { supabase } from "../client";

type AddProgressData = {
  case_id: string;
  title: string;
  description: string;
  document: File; // single document with file.name included
  amount: number; // <-- NEW: amount used in this update
};

type EditProgressData = {
  id: string;
  case_id: string;
  title: string;
  description: string;
  document: File | null; // null means unchanged
  amount?: number; // optional, only updated if provided
};

/**
 * Insert a new case update into Supabase with transactional safety
 */
export async function addProgress(formData: AddProgressData) {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) throw new Error("No active session found");

  let uploadedDocUrl = "";
  let publicId = "";

  try {
    // Upload document
    if (formData.document) {
      const baseName = formData.document.name.replace(/\.[^/.]+$/, "");
      const uploadRes = await uploadViaEdge(
        session.access_token,
        formData.document,
        baseName,
        `needy-portal/cases/${formData.case_id}`
      );
      uploadedDocUrl = uploadRes.url;
      publicId = uploadRes.public_id;
    }

    // Insert update into Supabase
    const { error: caseError } = await supabase.from("case_updates").insert({
      case_id: formData.case_id,
      title: formData.title,
      description: formData.description,
      doc_url: uploadedDocUrl,
      amount: formData.amount, // <-- NEW
    });

    if (caseError) throw caseError;
    const { data: donations, error: donationError } = await supabase
      .from("case_donations")
      .select("*")
      .eq("case_id", "5c3e0675-fd2a-4869-a7c6-729479238481");
    console.log("🚀 ~ addProgress ~ donations:", donations);

    if (donationError) throw donationError;

    if (!donations || donations.length === 0) return { success: true };

    // 5. Remove duplicate donor IDs
    const uniqueDonorIds = [...new Set(donations.map((d) => d.donator_id))];

    // 6. Fetch emails from profiles table
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .in("id", uniqueDonorIds);
    console.log("🚀 ~ addProgress ~ profiles:", profiles);

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) return { success: true };

    // 7. Build clean email array
    const emails = profiles.map((p) => p.email).filter(Boolean);

    // 8. Send email
    await fetch(
      "https://donation-portal-email-service.vercel.app/send-emails",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseTitle: formData.title,
          amount: formData.amount,
          emails,
        }),
      }
    );

    return { success: true, docUrl: uploadedDocUrl };
  } catch (error) {
    if (publicId) {
      try {
        await deleteViaEdge(session.access_token, publicId);
      } catch (cleanupError) {
        console.error("Failed to clean up Cloudinary file:", cleanupError);
      }
    }
    throw error;
  }
}

/**
 * Edit a case update
 * - Replace document only if a new one is provided
 * - Update amount if provided
 */
export async function editProgress(formData: EditProgressData) {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) throw new Error("No active session found");

  let newDocUrl = "";
  let newPublicId = "";

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from("case_updates")
      .select("doc_url")
      .eq("id", formData.id)
      .single();

    if (fetchErr) throw fetchErr;
    const oldDocUrl = existing?.doc_url;

    // If document changed → delete & upload new
    if (formData.document) {
      if (oldDocUrl) {
        try {
          await deleteViaEdge(
            session.access_token,
            `${extractPublicIdFromUrl(oldDocUrl)}`
          );
        } catch (err) {
          console.error("Old doc delete failed:", err);
        }
      }

      const baseName = formData.document.name.replace(/\.[^/.]+$/, "");
      const uploadRes = await uploadViaEdge(
        session.access_token,
        formData.document,
        baseName,
        `needy-portal/cases/${formData.case_id}`
      );

      newDocUrl = uploadRes.url;
      newPublicId = uploadRes.public_id;
    }

    // Update Supabase row
    const { error: updateErr } = await supabase
      .from("case_updates")
      .update({
        title: formData.title,
        description: formData.description,
        ...(formData.document ? { doc_url: newDocUrl } : {}),
        ...(formData.amount !== undefined ? { amount: formData.amount } : {}), // <-- update amount if provided
      })
      .eq("id", formData.id);

    if (updateErr) throw updateErr;

    return { success: true };
  } catch (error) {
    if (newPublicId) {
      try {
        await deleteViaEdge(
          session.access_token,
          `needy-portal/cases/${formData.case_id}`
        );
      } catch (cleanupErr) {
        console.error("Cleanup failed:", cleanupErr);
      }
    }
    throw error;
  }
}

/**
 * Delete a case update
 */
export async function deleteProgress(progressId: string) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) throw new Error("No active session");

    const accessToken = session.access_token;

    const { data: record, error: fetchError } = await supabase
      .from("case_updates")
      .select("doc_url")
      .eq("id", progressId)
      .single();

    if (fetchError) throw fetchError;

    try {
      const publicId = extractPublicIdFromUrl(record.doc_url!);
      await deleteViaEdge(accessToken, publicId);
    } catch (err) {
      console.error("File deletion failed:", err);
    }

    const { error: deleteError } = await supabase
      .from("case_updates")
      .delete()
      .eq("id", progressId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (err: any) {
    console.error("Delete progress error:", err);
    return { success: false, error: err.message };
  }
}
