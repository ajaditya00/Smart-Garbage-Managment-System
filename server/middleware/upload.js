import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage engine
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'swachh-ai',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [{ width: 1280, height: 960, crop: 'limit', quality: 'auto' }]
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
    return cb(null, true);
  } else {
    console.error(`File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error(`Error: Invalid file type. Only ${allowedExtensions.join(', ')} images are allowed.`));
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

export { upload };
export default upload;