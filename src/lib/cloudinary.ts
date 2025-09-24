// Helper: call your Supabase Edge Function
export async function uploadViaEdge(
  access_token: string,
  file: File,
  publicId: string,
  folder?: string
) {
  const body = new FormData();
  body.append("file", file);
  body.append("public_id", publicId);
  if (folder) body.append("folder", folder);

  const res = await fetch(
    "https://zzrpswbwbxtnblpvqimw.supabase.co/functions/v1/upload-cloudinary",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }

  return res.json(); // { url, public_id }
}
// Helper: call your Supabase Edge Function to delete a file from Cloudinary
export async function deleteViaEdge(access_token: string, publicId: string) {
  const body = { public_id: publicId };

  const res = await fetch(
    "https://zzrpswbwbxtnblpvqimw.supabase.co/functions/v1/delete-cloudinary",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const raw = await res.text();
    let err: any = {};
    try {
      err = JSON.parse(raw);
    } catch {
      // raw text is not JSON
    }
    console.error("Delete response:", raw);
    throw new Error(err.error || `Delete failed: ${raw.substring(0, 50)}...`);
  }

  return res.json(); // { success, public_id }
}

// Helper: call your Supabase Edge Function to delete a whole folder from Cloudinary
export async function deleteFolderViaEdge(
  access_token: string,
  folder: string
) {
  const body = { folder };

  const res = await fetch(
    "https://zzrpswbwbxtnblpvqimw.supabase.co/functions/v1/delete-folder-byprefix",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const raw = await res.text();
    let err: any = {};
    try {
      err = JSON.parse(raw);
    } catch {
      // raw text is not JSON
    }
    console.error("Delete folder response:", raw);
    throw new Error(
      err.error || `Delete folder failed: ${raw.substring(0, 50)}...`
    );
  }

  return res.json(); // { success, folder }
}
