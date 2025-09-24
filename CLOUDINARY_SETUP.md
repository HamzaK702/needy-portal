# Cloudinary Setup Instructions

This project now uses Cloudinary for file uploads instead of Supabase storage. Follow these steps to set up Cloudinary:

## 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Once logged in, you'll find your credentials in the Dashboard

## 2. Get Your Cloudinary Credentials

From your Cloudinary Dashboard, you'll need:
- **Cloud Name**: Found in the Dashboard
- **API Key**: Found in the Dashboard
- **API Secret**: Found in the Dashboard

## 3. Create Upload Presets

You need to create **TWO** upload presets for different access levels:

### Public Upload Preset (for profile pictures)
1. In your Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `caretaker-portal-uploads`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `caretaker-portal/profile-pics` (optional, for organization)
   - **Access Mode**: `Public`
   - **⚠️ IMPORTANT**: Check "Allow unsigned uploads" checkbox
5. Save the preset

### Private Upload Preset (for CNIC files)
1. Create another upload preset:
   - **Preset name**: `caretaker-portal-private-uploads`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `caretaker-portal/cnic-files` (optional, for organization)
   - **Access Mode**: `Authenticated` (requires authentication to access)
   - **⚠️ IMPORTANT**: Check "Allow unsigned uploads" checkbox
2. Save the preset

### How This Works
- **Profile Pictures**: Uploaded with `Public` access (fast loading, direct URL access)
- **CNIC Files**: Uploaded with `Authenticated` access (secure, requires authentication to view)
- **No SDK Required**: Uses direct Cloudinary API calls with upload presets
- **Simple & Secure**: Different access levels for different file types

## 4. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration (existing)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloudinary Configuration (new)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cloudinary Upload Presets
VITE_CLOUDINARY_UPLOAD_PRESET=caretaker-portal-uploads
VITE_CLOUDINARY_PRIVATE_UPLOAD_PRESET=caretaker-portal-private-uploads
```

## 5. File Organization

Files will be uploaded to Cloudinary with the following structure:
- **CNIC files**: `caretaker-portal/cnic-files/{userId}/cnic-{timestamp}`
- **Profile pictures**: `caretaker-portal/profile-pics/{userId}/profile-{timestamp}`

## 6. Testing

After setting up the environment variables:
1. Restart your development server
2. Try uploading files through the welcome form
3. Check your Cloudinary Dashboard to see uploaded files

## Troubleshooting

### Common Issues

- **"Upload preset must be whitelisted for unsigned uploads"**: 
  - Go to your Cloudinary Dashboard → Settings → Upload
  - Find your upload preset and click "Edit"
  - Make sure "Allow unsigned uploads" is checked ✅
  - Save the preset

- **Upload fails**: Check that your upload preset is set to "Unsigned"
- **CORS errors**: Ensure your Cloudinary account allows uploads from your domain
- **File not found**: Verify the folder structure and public IDs match your configuration

### Quick Fix for "Upload preset must be whitelisted" Error

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload**
3. Find your upload preset (`caretaker-portal-uploads` or `caretaker-portal-private-uploads`)
4. Click the **Edit** button (pencil icon)
5. Scroll down to **Upload behavior**
6. Check the box **"Allow unsigned uploads"**
7. Click **Save**
8. Try uploading again