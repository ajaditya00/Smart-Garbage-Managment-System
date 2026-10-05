import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Ensure environment variables are loaded if upload.js is evaluated before server.js dotenv.config()
dotenv.config();

// ─── Cloudinary configuration & validation ──────────────────────────────────
function validateCloudinaryConfig({ throwOnMissing = false } = {}) {
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');

  if (missing.length > 0) {
    const errorMsg = `Cloudinary configuration error: Missing required environment variable(s): ${missing.join(', ')}. Image uploads will fail. Please configure them in your environment settings.`;
    if (throwOnMissing || process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      console.warn(`[Cloudinary Warning] ${errorMsg}`);
    }
    return false;
  }
  return true;
}

function getCloudinaryInstance({ isUpload = false } = {}) {
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');

  if (missing.length > 0) {
    if (isUpload || process.env.NODE_ENV === 'production') {
      throw new Error(`Cloudinary is not configured. Missing required credentials: ${missing.join(', ')}`);
    }
  }

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
    // Validate credentials when upload occurs
    getCloudinaryInstance({ isUpload: true });
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

export { complaintUpload, standaloneUpload, validateCloudinaryConfig };
export default complaintUpload;