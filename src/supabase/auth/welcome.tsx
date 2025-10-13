// src/supabase/auth/welcomeNeedy.ts
import { uploadViaEdge } from "@/lib/cloudinary";
import { supabase } from "../client";

type WelcomeValues = {
  roleType: "widow" | "orphan";
  cnicFile?: FileList;
  spouseCnicFile?: FileList;
  deathCertificate?: FileList;
  birthCertificate?: FileList;
  guardianInfo?: string;
  supportingDocument?: FileList;
  areaOfOperations: string;
  profilePic?: FileList;
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

  // --- Uploads based on role type ---
  const uploads: Record<string, string | null> = {};

  if (formData.roleType === "widow") {
    uploads.cnic_self_url = await uploadFile(
      formData.cnicFile,
      "cnic-self",
      "cnic-self"
    );
    uploads.cnic_spouse_url = await uploadFile(
      formData.spouseCnicFile,
      "cnic-spouse",
      "cnic-spouse"
    );
    uploads.death_certificate_spouse_url = await uploadFile(
      formData.deathCertificate,
      "death-certificates",
      "death-spouse"
    );
  } else if (formData.roleType === "orphan") {
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

  // --- Optional profile picture ---
  uploads.profile_pic_url = await uploadFile(
    formData.profilePic,
    "profile-pics",
    "profile"
  );

  // --- Insert into needy_profiles ---
  const { error: needyError } = await supabase.from("needy_profiles").insert({
    profile_id: userId,
    role_type: formData.roleType,
    area_of_operations: formData.areaOfOperations,
    guardian_info: formData.guardianInfo || null,
    ...uploads,
  });

  if (needyError) throw needyError;

  // --- Mark profile as completed ---
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ isprofilecompleted: true })
    .eq("id", userId);

  if (profileError) throw profileError;

  localStorage.setItem(`${userId}_isProfileCompleted`, "true");

  return { success: true };
}
