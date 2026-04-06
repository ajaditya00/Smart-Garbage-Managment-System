// @desc    Upload an image to Cloudinary and return the URL + metadata
// @route   POST /api/uploads
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    // Log what Cloudinary returned
    console.log('[uploadImage] req.file keys:', Object.keys(req.file));
    console.log('[uploadImage] req.file.path:', req.file.path);

    // multer-storage-cloudinary v4: path = secure_url, filename = public_id, size = bytes
    const imageUrl = req.file.path || null;
    const referenceId = req.body.referenceId || null;

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        url          : imageUrl,
        publicId     : req.file.filename || null,
        bytes        : req.file.size     || null,
        originalname : req.file.originalname,
        referenceId
      }
    });
  } catch (error) {
    console.error('[uploadImage] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image.',
      error  : error.message,
      stack  : process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export { uploadImage };
