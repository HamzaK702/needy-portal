// src/supabase/auth/welcomeNeedy.ts
import { uploadViaEdge } from "@/lib/cloudinary";
import { supabase } from "../client";

type WelcomeValues = {
  roleType: "widow" | "orphan";

  // Self CNIC
  cnicFront?: FileList;
  cnicBack?: FileList;

  // Spouse CNIC (widow)
  spouseCnicFront?: FileList;
  spouseCnicBack?: FileList;

  deathCertificate?: FileList;
  birthCertificate?: FileList;
  guardianInfo?: string;
  supportingDocument?: FileList;

  areaOfOperations: string;
  profilePic?: FileList;

  children?: {
    bformNo: string;
  }[];
};

export async function completeNeedyProfile(
  userId: string,
  formData: WelcomeValues
) {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) throw new Error("No active session found");

  const uploadFile = async (
    fileList: FileList | undefined,
    folder: string,
    label: string
  ) => {
    if (!fileList || fileList.length === 0) return null;

    const file = fileList[0];
    const publicId = `${userId}/${label}-${Date.now()}`;

    const result = await uploadViaEdge(
      session.access_token,
      file,
      publicId,
      `needy-portal/${folder}`
    );

    return result.url;
  };

  // ---------------- Uploads ----------------
  const uploads: Record<string, string | null> = {};

  if (formData.roleType === "widow") {
    // Self CNIC
    uploads.cnic_self_front_url = await uploadFile(
      formData.cnicFront,
      "cnic-self",
      "cnic-self-front"
    );

    uploads.cnic_self_back_url = await uploadFile(
      formData.cnicBack,
      "cnic-self",
      "cnic-self-back"
    );

    // Spouse CNIC
    uploads.cnic_spouse_front_url = await uploadFile(
      formData.spouseCnicFront,
      "cnic-spouse",
      "cnic-spouse-front"
    );

    uploads.cnic_spouse_back_url = await uploadFile(
      formData.spouseCnicBack,
      "cnic-spouse",
      "cnic-spouse-back"
    );

    // Death certificate (spouse)
    uploads.death_certificate_spouse_url = await uploadFile(
      formData.deathCertificate,
      "death-certificates",
      "death-spouse"
    );
  }

  if (formData.roleType === "orphan") {
    uploads.birth_certificate_url = await uploadFile(
      formData.birthCertificate,
      "birth-certificates",
      "birth-cert"
    );

    uploads.death_certificate_parents_url = await uploadFile(
      formData.deathCertificate,
      "death-certificates",
      "death-parents"
    );

    uploads.supporting_document_url = await uploadFile(
      formData.supportingDocument,
      "supporting-docs",
      "supporting"
    );
  }

  // Profile picture (optional)
  uploads.profile_pic_url = await uploadFile(
    formData.profilePic,
    "profile-pics",
    "profile"
  );

  // ---------------- Insert ----------------
  const { error: needyError } = await supabase.from("needy_profiles").insert({
    profile_id: userId,
    role_type: formData.roleType,
    area_of_operations: formData.areaOfOperations,
    guardian_info: formData.guardianInfo || null,
    childrens: formData.children || null,
    ...uploads,
  });

  if (needyError) throw needyError;

  // ---------------- Mark completed ----------------
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ isprofilecompleted: true })
    .eq("id", userId);

  if (profileError) throw profileError;

  localStorage.setItem(`${userId}_isProfileCompleted`, "true");

  return { success: true };
}
