import { validationResult } from 'express-validator';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ─── Image handling ────────────────────────────────────────────────────────
    // multer-storage-cloudinary v4 sets these fields on req.file:
    //   path     → Cloudinary secure_url  (the HTTPS image URL)
    //   filename → Cloudinary public_id
    //   size     → bytes
    let imageUrl = req.body.image || null;
    let imageData = req.body.imageData ? (typeof req.body.imageData === 'string' ? JSON.parse(req.body.imageData) : req.body.imageData) : {};

    if (req.file) {
      console.log('[createComplaint] req.file keys:', Object.keys(req.file));
      console.log('[createComplaint] req.file.path:', req.file.path);

      imageUrl = req.file.path || null;  // path = secure_url from Cloudinary

      imageData = {
        publicId : req.file.filename || null,   // filename = public_id
        url      : imageUrl,
        bytes    : req.file.size    || null
      };
    }
    // ───────────────────────────────────────────────────────────────────────────

    const { title, location, category, description } = req.body;

    // Parse location — it may arrive as a JSON string from FormData
    let locationData;
    try {
      locationData = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (e) {
      console.error('Location parsing error:', e);
      return res.status(400).json({
        message: 'Invalid location format. Must be a valid JSON string.'
      });
    }

    if (!locationData || !locationData.address) {
      return res.status(400).json({ message: 'Location address is required' });
    }

    const { latitude, longitude, address } = locationData;

    // ─── Persist complaint (image upload is independent) ──────────────────────
    const complaint = await Complaint.create({
      userId: req.user._id,
      title,
      image: imageUrl,      // plain URL for quick display
      imageData,            // full Cloudinary metadata
      location: {
        latitude : latitude  && !isNaN(parseFloat(latitude))  ? parseFloat(latitude)  : null,
        longitude: longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null,
        address
      },
      category,
      description
    });

    await complaint.populate('userId', 'name email');

    console.log('[createComplaint] Saved complaint image URL:', complaint.image);

    res.status(201).json(complaint);
  } catch (error) {
    console.error('[createComplaint] Error:', error.message);
    console.error('[createComplaint] req.file:', req.file);
    res.status(500).json({
      message: 'Failed to create complaint',
      error  : error.message,
      stack  : process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get complaints (role-filtered)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'citizen') {
      query.userId = req.user._id;
    } else if (req.user.role === 'employee' || req.user.role === 'ngo') {
      query.$or = [
        { assignedTo: req.user._id },
        { status: 'pending' }
      ];
    }
    // Admin can see all complaints (no filter)

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check permissions
    if (req.user.role === 'citizen' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Employee/NGO)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.updatedAt = Date.now();

    if (status === 'completed' && req.file) {
      // Cloudinary URL for proof image
      const proofUrl = req.file.path || req.file.secure_url;
      await Assignment.findOneAndUpdate(
        { complaintId: complaint._id, assigneeId: req.user._id },
        {
          proofImage: proofUrl,
          completedAt: new Date()
        }
      );
    }

    await complaint.save();
    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name role');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus
};