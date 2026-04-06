import express from 'express';
import { protect } from '../middleware/auth.js';
import { standaloneUpload } from '../middleware/upload.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

// @desc    Upload an image to Cloudinary and return the URL + metadata
// @route   POST /api/uploads
// @access  Private (any authenticated user)
// Body (multipart/form-data):
//   image       — the image file
//   referenceId — (optional) complaint reference to tag this upload with
router.post('/', protect, standaloneUpload.single('image'), uploadImage);

export default router;
