import { deleteFolderViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { supabase } from "../client";

type CaseDoc = {
  docName: string;
  file: File | null;
};

type AddCaseFormData = {
  userId: string;
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

  caseImage?: File | null; // ✅ ADD THIS
  docs: CaseDoc[];
};

export async function addCase(formData: AddCaseFormData) {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) throw new Error("No active session found");

  const caseId = crypto.randomUUID();

  const uploadedDocs: { name: string; url: string; publicId: string }[] = [];
  let caseImageUpload: { url: string; publicId: string } | null = null;

  try {
    // 1️⃣ Upload CASE IMAGE (same style, before DB insert)
    if (formData.caseImage) {
      const uploadRes = await uploadViaEdge(
        session.access_token,
        formData.caseImage,
        "case-image",
        `needy-portal/cases/${caseId}`
      );

      caseImageUpload = {
        url: uploadRes.url,
        publicId: uploadRes.public_id,
      };
    }

    // 2️⃣ Upload DOCUMENTS
    for (const doc of formData.docs) {
      if (doc.file) {
        const baseName = doc.docName.replace(/\.[^/.]+$/, "");

        const uploadRes = await uploadViaEdge(
          session.access_token,
          doc.file,
          baseName,
          `needy-portal/cases/${caseId}`
        );

        uploadedDocs.push({
          name: doc.docName,
          url: uploadRes.url,
          publicId: uploadRes.public_id,
        });
      }
    }

    // 3️⃣ Insert CASE in Supabase
    const { error } = await supabase.from("cases").insert({
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

      case_image: caseImageUpload?.url ?? null, // ✅ SAME PATTERN
      docs: uploadedDocs.map((d) => ({ name: d.name, url: d.url })),

      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true, caseId };
  } catch (error) {
    // 🔥 FULL CLEANUP (same as docs)
    try {
      await deleteFolderViaEdge(
        session.access_token,
        `needy-portal/cases/${caseId}`
      );
    } catch (cleanupError) {
      console.error("Cloudinary cleanup failed", cleanupError);
    }

    throw error;
  }
}
