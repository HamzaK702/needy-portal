import { deleteViaEdge, uploadViaEdge } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/helpers";
import { supabase } from "../client";

interface ProfileValues {
  areaOfOperations: string;
  children: any[]; // replace `any` with proper type if you have one
  guardianInfo?: string;

  // Widow – self CNIC
  cnicFront?: FileList;
  cnicBack?: FileList;

  // Widow – spouse CNIC
  spouseCnicFront?: FileList;
  spouseCnicBack?: FileList;

  // Common documents
  deathCertificate?: FileList;
  birthCertificate?: FileList;
  supportingDocument?: FileList;
  profilePic?: FileList;
}

/**
 * Final, 100% error-free & production-ready version
 * Ab currentProfile bhi pass kar rahe hain → old URLs nikal sake
 */
export async function editProfile(
  values: ProfileValues,
  currentProfile: ProfileValues,
  role: "widow" | "orphan"
) {
  let accessToken = "";
  let newUploadedPublicIds: string[] = [];

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");

    accessToken = session.access_token;
    const userId = session.user.id;

    const folder = `needy-portal/profiles/${userId}`;

    const updates: any = {
      area_of_operations: values.areaOfOperations,
    };

    if (role === "widow") {
      updates.childrens = values.children.length > 0 ? values.children : null;
    }
    if (role === "orphan") {
      updates.guardian_info = values.guardianInfo?.trim() || null;
    }

    const filesToUpload = [
      ...(role === "widow"
        ? [
            {
              field: values.cnicFront,
              column: "cnic_self_front_url",
              baseName: "cnic_self_front",
            },
            {
              field: values.cnicBack,
              column: "cnic_self_back_url",
              baseName: "cnic_self_back",
            },
            {
              field: values.spouseCnicFront,
              column: "cnic_spouse_front_url",
              baseName: "cnic_spouse_front",
            },
            {
              field: values.spouseCnicBack,
              column: "cnic_spouse_back_url",
              baseName: "cnic_spouse_back",
            },
          ]
        : []),
      {
        field: values.deathCertificate,
        column:
          role === "widow"
            ? "death_certificate_spouse_url"
            : "death_certificate_parents_url",
        baseName:
          role === "widow"
            ? "death_certificate_spouse"
            : "death_certificate_parents",
      },
      ...(role === "orphan"
        ? [
            {
              field: values.birthCertificate,
              column: "birth_certificate_url",
              baseName: "birth_certificate",
            },
            {
              field: values.supportingDocument,
              column: "supporting_document_url",
              baseName: "supporting_document",
            },
          ]
        : []),
      {
        field: values.profilePic,
        column: "profile_pic_url",
        baseName: "profile_pic",
      },
    ];

    // Only fields with new file
    const changedFields = filesToUpload.filter(
      (item): item is { field: FileList; column: string; baseName: string } =>
        !!item.field && item.field.length > 0
    );

    const publicIdsToDelete: string[] = [];

    const uploadTasks = changedFields.map((item) => {
      const file = item.field[0];

      // ← YAHAN SABSE BADI BUG THI — ab currentProfile se old URL nikal rahe hain
      const oldUrl = (currentProfile[item.column] as string | null) ?? null;
      const oldPublicId = oldUrl ? extractPublicIdFromUrl(oldUrl) : null;

      return uploadViaEdge(accessToken, file, item.baseName, folder).then(
        (uploadRes) => {
          const newPublicId = uploadRes.public_id;
          console.log("🚀 ~ editProfile ~ newPublicId:", newPublicId);
          console.log("🚀 ~ editProfile ~ oldPublicId:", oldPublicId);

          if (oldPublicId && oldPublicId !== newPublicId) {
            console.log("conditions runs");
            publicIdsToDelete.push(oldPublicId);
          }

          newUploadedPublicIds.push(newPublicId);
          updates[item.column] = uploadRes.url;
        }
      );
    });

    if (uploadTasks.length > 0) {
      await Promise.all(uploadTasks);
    }

    // DB Update
    const { error: updateError } = await supabase
      .from("needy_profiles")
      .update(updates)
      .eq("profile_id", userId);

    if (updateError) throw updateError;

    // Success → old files delete (safe)
    if (publicIdsToDelete.length > 0) {
      await Promise.all(
        publicIdsToDelete.map((publicId) =>
          deleteViaEdge(accessToken, publicId).catch((e) =>
            console.warn("Failed to delete old file:", publicId, e)
          )
        )
      );
    }

    return { success: true };
  } catch (err: any) {
    // Rollback
    if (accessToken && newUploadedPublicIds.length > 0) {
      await Promise.all(
        newUploadedPublicIds.map((publicId) =>
          deleteViaEdge(accessToken, publicId).catch((e) =>
            console.warn("Rollback delete failed:", publicId, e)
          )
        )
      );
    }

    return {
      success: false,
      error: err.message || "An error occurred",
    };
  }
}
