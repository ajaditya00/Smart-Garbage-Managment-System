import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// ─── Lazy Cloudinary configuration ───────────────────────────────────────────
// Configure INSIDE the params function (called at request time, not import time)
// so that process.env is populated after dotenv.config() has run in server.js.
// ─────────────────────────────────────────────────────────────────────────────
function getCloudinaryInstance() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key   : process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  return cloudinary;
}

// Storage for complaint images (folder: swachh-ai/complaints)
const complaintStorage = new CloudinaryStorage({
  cloudinary: getCloudinaryInstance(),
  params: (req, file) => {
    // Re-configure at request time to guarantee env vars are loaded
    getCloudinaryInstance();
    return {
      folder        : 'swachh-ai/complaints',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1280, height: 960, crop: 'limit', quality: 'auto' }],
      public_id     : `complaint_${Date.now()}_${Math.round(Math.random() * 1e9)}`
    };
  }
});

// Storage for standalone /api/uploads
const uploadStorage = new CloudinaryStorage({
  cloudinary: getCloudinaryInstance(),
  params: (req, file) => {
    getCloudinaryInstance();
    return {
      folder        : 'swachh-ai/uploads',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1280, height: 960, crop: 'limit', quality: 'auto' }],
      public_id     : `${req.body.referenceId || 'upload'}_${Date.now()}`
    };
  }
});

// ─── File filter: validate by MIME type (more reliable for browser uploads) ──
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    return cb(null, true);
  }
  console.error(`[upload] File rejected: ${file.originalname} (${file.mimetype})`);
  cb(new Error(`Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.`));
};

// ─── Multer instances ─────────────────────────────────────────────────────────
const complaintUpload = multer({
  storage  : complaintStorage,
  limits   : { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: imageFileFilter
});

const standaloneUpload = multer({
  storage  : uploadStorage,
  limits   : { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: imageFileFilter
});

export { complaintUpload, standaloneUpload };
export default complaintUpload;