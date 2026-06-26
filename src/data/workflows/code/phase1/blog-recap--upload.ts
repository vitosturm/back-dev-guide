export const code = `import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'recap_posts', // all uploads go to this Cloudinary folder
  } as any,
});

const upload = multer({ storage });

// upload.single('image') sets req.file after uploading to Cloudinary:
//   req.file.path     → Cloudinary CDN URL (not a local path)
//   req.file.filename → Cloudinary public_id (use this to destroy the file later)
export default upload;
`
