// src/supabase/auth/welcomeCaretaker.ts
import { supabase } from "../client";

type WelcomeFormData = {
  userId: string;
  areaOfOperations: string;
  cnicFile: FileList;
  profilePic?: FileList;
};

export async function completeCaretakerProfile(formData: WelcomeFormData) {
  // Step 1: Upload CNIC (private bucket)
  const cnicFile = formData.cnicFile[0];
  const cnicPath = `${formData.userId}/cnic-${cnicFile.name}`;
  const { error: cnicError } = await supabase.storage
    .from("cnic-files")
    .upload(cnicPath, cnicFile, { cacheControl: "3600", upsert: false });

  if (cnicError) throw cnicError;

  const cnicFilePath = cnicPath;

  // Step 2: Upload Profile Pic (optional, public)
  let profilePicUrl: string | null = null;
  if (formData.profilePic && formData.profilePic.length > 0) {
    const picFile = formData.profilePic[0];
    const picPath = `profile/${formData.userId}-${picFile.name}`;
    const { error: picError } = await supabase.storage
      .from("profile-pics")
      .upload(picPath, picFile, { cacheControl: "3600", upsert: false });

    if (picError) throw picError;

    profilePicUrl = supabase.storage.from("profile-pics").getPublicUrl(picPath)
      .data.publicUrl;
  }

  // Step 3: Insert caretaker profile details
  const { error: caretakerError } = await supabase
    .from("caretaker_profiles")
    .insert({
      profile_id: formData.userId,
      area_of_operations: formData.areaOfOperations,
      cnic_file_path: cnicFilePath,
      profile_pic_url: profilePicUrl,
    });

  if (caretakerError) throw caretakerError;

  return { success: true };
}
