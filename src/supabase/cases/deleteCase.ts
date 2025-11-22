import { deleteFolderViaEdge } from "@/lib/cloudinary";
import { supabase } from "../client";

export async function deleteCase(caseId: string) {
  try {
    // 1️⃣ Fetch and validate session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      throw new Error("No active session found");
    }
    const accessToken = sessionData.session.access_token;
    const userId = sessionData.session.user.id;

    const folderPrefix = `needy-portal/cases/${caseId}/`; // Prefix with trailing / for folder deletion

    // 2️⃣ Delete all resources by prefix (handles all files in folder)
    let deletionErrors: string[] = [];
    try {
      await deleteFolderViaEdge(accessToken, folderPrefix); // Assumes Edge Function supports prefix deletion
      console.log(`Resources deleted for prefix: ${folderPrefix}`);
    } catch (err: any) {
      console.error("Failed to delete resources by prefix:", err);
      deletionErrors.push(`Resources: ${err.message || "Unknown error"}`);
    }

    // 3️⃣ Wait for propagation (key fix from SO + docs)
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 3-second delay; adjust if needed

    // 4️⃣ Delete the empty folder (with retry logic)
    let folderDeleted = false;
    let retryCount = 0;
    const maxRetries = 3;
    while (!folderDeleted && retryCount < maxRetries) {
      try {
        await deleteFolderViaEdge(accessToken, `needy-portal/cases/${caseId}`);
        console.log(`Folder deleted: caretaker-portal/cases/${caseId}`);
        folderDeleted = true;
      } catch (folderErr: any) {
        console.error(
          `Folder deletion attempt ${retryCount + 1} failed:`,
          folderErr
        );
        if (
          folderErr.message?.includes("Folder is not empty") ||
          folderErr.http_code === 400
        ) {
          // Exponential backoff: 3s, 6s, 12s
          const delay = Math.pow(2, retryCount) * 3000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          retryCount++;
        } else {
          // Non-recoverable error
          deletionErrors.push(
            `Folder: ${folderErr.message || "Unknown error"}`
          );
          break;
        }
      }
    }

    if (!folderDeleted) {
      deletionErrors.push("Folder deletion failed after retries");
    }

    // 5️⃣ Delete case from Supabase
    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("id", caseId)
      .eq("user_id", userId);
    if (error) {
      throw new Error(`Supabase deletion failed: ${error.message}`);
    }

    // 6️⃣ Return with warnings if any
    if (deletionErrors.length > 0) {
      return { success: true, warnings: deletionErrors };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting case:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
