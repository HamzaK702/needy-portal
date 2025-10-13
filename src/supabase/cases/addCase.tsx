import { deleteFolderViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { supabase } from "../client";

type CaseDoc = {
  docName: string;
  file: File | null;
};

type AddCaseFormData = {
  userId: string; // caretaker or needy user id
  name: string;
  cnic: string;
  phone: string;
  address: string;
  title: string;
  shortStory: string;
  fullStory: string;
  category: string;
  urgencyLevel: string;
  requiredAmount: number;
  familyMembers: number;
  monthlyIncome?: number;
  isRecurring: boolean;
  recurringDuration?: number;
  location: string;
  docs: CaseDoc[];
};

/**
 * Insert a new case into Supabase with transactional safety
 */
export async function addCase(formData: AddCaseFormData) {
  // 1. Get session
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    throw new Error("No active session found");
  }

  // 2. Generate a unique case ID (e.g., UUID)
  const caseId = crypto.randomUUID();

  // 3. Upload all documents to Cloudinary and track publicIds for cleanup
  const uploadedDocs: { name: string; url: string; publicId: string }[] = [];
  const publicIdsToCleanup: string[] = [];

  try {
    for (const doc of formData.docs) {
      if (doc.file) {
        const baseName = doc.docName.replace(/\.[^/.]+$/, ""); // file ka naam without

        const uploadRes = await uploadViaEdge(
          session.access_token,
          doc.file,
          baseName,
          `needy-portal/cases/${caseId}`
        );

        // 👇 store the exact Cloudinary public_id, not the one you built
        publicIdsToCleanup.push(uploadRes?.public_id);
        uploadedDocs.push({
          name: doc.docName,
          url: uploadRes.url,
          publicId: uploadRes.public_id,
        });
      }
    }

    // 4. Insert case into Supabase
    const { error: caseError } = await supabase.from("cases").insert({
      id: caseId,
      user_id: formData.userId,
      name: formData.name,
      cnic: formData.cnic,
      phone: formData.phone,
      address: formData.address,
      title: formData.title,
      short_story: formData.shortStory,
      full_story: formData.fullStory,
      category: formData.category,
      urgency_level: formData.urgencyLevel,
      required_amount: formData.requiredAmount,
      raised_amount: 0,
      family_members: formData.familyMembers,
      monthly_income: formData.monthlyIncome,
      is_recurring: formData.isRecurring,
      recurring_duration: formData.recurringDuration,
      location: formData.location,
      docs: uploadedDocs.map((doc) => ({ name: doc.name, url: doc.url })), // Store only name and url
      created_at: new Date().toISOString(),
    });

    if (caseError) throw caseError;

    // If successful, clear the cleanup list as no rollback is needed
    publicIdsToCleanup.length = 0;
    return { success: true, caseId };
  } catch (error) {
    // Cleanup: Delete uploaded files from Cloudinary if insertion failed

    try {
      await deleteFolderViaEdge(
        session.access_token,
        `needy-portal/cases/${caseId}`
      );
    } catch (cleanupError) {
      console.error("Failed to clean up Cloudinary file:", cleanupError);
    }

    throw error; // Re-throw the original error after cleanup
  }
}
