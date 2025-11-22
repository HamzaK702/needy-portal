import { deleteViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/helpers";
import { supabase } from "../client";

type AddProgressData = {
  case_id: string;
  title: string;
  description: string;
  document: File; // single document with file.name included
};

type EditProgressData = {
  id: string;
  case_id: string;
  title: string;
  description: string;
  document: File | null; // null means unchanged
};

/**
 * Insert a new case update into Supabase with transactional safety
 */
export async function addProgress(formData: AddProgressData) {
  // 1. Get session
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    throw new Error("No active session found");
  }

  let uploadedDocUrl = "";
  let publicId = "";

  try {
    // 2. Upload document to Cloudinary
    if (formData.document) {
      const baseName = formData.document.name.replace(/\.[^/.]+$/, ""); // file name without extension

      const uploadRes = await uploadViaEdge(
        session.access_token,
        formData.document,
        baseName,
        `needy-portal/cases/${formData.case_id}`
      );

      uploadedDocUrl = uploadRes.url;
      publicId = uploadRes.public_id;
    }

    // 3. Insert update into Supabase
    const { error: caseError } = await supabase.from("case_updates").insert({
      case_id: formData.case_id,
      title: formData.title,
      description: formData.description,
      doc_url: uploadedDocUrl,
    });

    if (caseError) throw caseError;

    // Success
    return { success: true, docUrl: uploadedDocUrl };
  } catch (error) {
    // Cleanup: delete uploaded file if insertion failed
    if (publicId) {
      try {
        await deleteViaEdge(
          session.access_token,
          `needy-portal/cases/${formData.case_id}`
        );
      } catch (cleanupError) {
        console.error("Failed to clean up Cloudinary file:", cleanupError);
      }
    }

    throw error; // rethrow original error
  }
}

/**
 * Edit a case update
 * - Replace document only if a new one is provided
 */
export async function editProgress(formData: EditProgressData) {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    throw new Error("No active session found");
  }

  let newDocUrl = "";
  let newPublicId = "";

  try {
    //  Fetch existing update (to get old doc_url)

    const { data: existing, error: fetchErr } = await supabase
      .from("case_updates")
      .select("doc_url")
      .eq("id", formData.id)
      .single();

    if (fetchErr) throw fetchErr;

    const oldDocUrl = existing?.doc_url;

    // ------------------------------------------
    // 2. If document changed → delete & upload new
    // ------------------------------------------
    if (formData.document) {
      // DELETE OLD FILE
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

      // UPLOAD NEW FILE
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

    // ------------------------------------------
    // 3. Update Supabase row
    // doc_url only updated if new doc uploaded
    // ------------------------------------------
    const { error: updateErr } = await supabase
      .from("case_updates")
      .update({
        title: formData.title,
        description: formData.description,
        ...(formData.document ? { doc_url: newDocUrl } : {}), // only replace if new doc
      })
      .eq("id", formData.id);

    if (updateErr) throw updateErr;

    return {
      success: true,
    };
  } catch (error) {
    // rollback new upload if update fails
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

export async function deleteProgress(progressId: string) {
  try {
    // 1) Session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) throw new Error("No active session");

    const accessToken = session.access_token;

    // 2) Fetch record
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

    // 4) Delete row from Supabase
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
