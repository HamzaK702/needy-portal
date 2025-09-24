// src/supabase/auth/welcomeCaretaker.ts
import { uploadViaEdge } from "@/lib/cloudinary";
import { supabase } from "../client";

type WelcomeFormData = {
  userId: string;
  areaOfOperations: string;
  cnicFile: FileList;
  profilePic?: FileList;
};

export async function completeCaretakerProfile(formData: WelcomeFormData) {
  // Step 1: Upload CNIC
  const { data } = await supabase.auth.getSession();

  const session = data?.session;
  if (!session) {
    console.error("No active session found");
    return;
  }

  const cnicFile = formData.cnicFile[0];
  const cnicPublicId = `${formData.userId}/cnic-${Date.now()}`;
  const cnicResult = await uploadViaEdge(
    session.access_token, // ✅ correct property
    cnicFile,
    cnicPublicId,
    "caretaker-portal/cnic-files"
  );

  // Step 2: Upload Profile Pic (optional)
  let profilePicUrl: string | null = null;
  if (formData.profilePic && formData.profilePic.length > 0) {
    const picFile = formData.profilePic[0];
    const picPublicId = `${formData.userId}/profile-${Date.now()}`;
    const picResult = await uploadViaEdge(
      session.access_token, // ✅ correct property
      picFile,
      picPublicId,
      "caretaker-portal/profile-pics"
    );
    profilePicUrl = picResult.url;
  }

  // Step 3: Insert caretaker profile details
  const { error: caretakerError } = await supabase
    .from("caretaker_profiles")
    .insert({
      profile_id: formData.userId,
      area_of_operations: formData.areaOfOperations,
      cnic_file_url: cnicResult.url,
      profile_pic_url: profilePicUrl,
    });

  if (caretakerError) throw caretakerError;

  // Step 4: Mark profile as completed
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ isprofilecompleted: true })
    .eq("id", formData.userId);

  if (profileError) throw profileError;

  // localStorage update
  localStorage.setItem(`${formData.userId}_isProfileCompleted`, "true");

  return { success: true };
}
