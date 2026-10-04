import { validationResult } from 'express-validator';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import { recordAuditLog } from '../utils/auditLogger.js';

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
    let imageUrl = req.body.image || null;
    let imageData = req.body.imageData ? (typeof req.body.imageData === 'string' ? JSON.parse(req.body.imageData) : req.body.imageData) : {};

    if (req.file) {
      imageUrl = req.file.path || null;
      imageData = {
        publicId: req.file.filename || null,
        url: imageUrl,
        bytes: req.file.size || null
      };
    }
    // ───────────────────────────────────────────────────────────────────────────

    const { title, location, category, description } = req.body;

    // Parse location
    let locationData;
    try {
      locationData = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (e) {
      return res.status(400).json({
        message: 'Invalid location format. Must be a valid JSON string.'
      });
    }

    if (!locationData || !locationData.address) {
      return res.status(400).json({ message: 'Location address is required' });
    }

    const { latitude, longitude, address } = locationData;

    const complaint = await Complaint.create({
      userId: req.user._id,
      title,
      image: imageUrl,
      imageData,
      location: {
        latitude: latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null,
        longitude: longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null,
        address
      },
      category,
      description
    });

    await complaint.populate('userId', 'name email');

    // Audit Log: CREATE Complaint
    recordAuditLog({
      req,
      action: 'CREATE',
      resource: 'Complaint',
      resourceId: complaint._id,
      target: { title: complaint.title, identifier: complaint._id.toString() },
      description: `Citizen "${req.user.name}" filed complaint "${complaint.title}"`,
      details: {
        title: complaint.title,
        category: complaint.category,
        address: complaint.location?.address,
        hasImage: !!complaint.image
      }
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('[createComplaint] Error:', error.message);
    res.status(500).json({
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};

// @desc    Get complaints (role-filtered)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'citizen') {
      query.userId = req.user._id;
    } else if (req.user.role === 'employee' || req.user.role === 'ngo') {
      query.$or = [
        { assignedTo: req.user._id },
        { status: 'pending' }
      ];
    }

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

    const previousStatus = complaint.status;
    complaint.status = status;
    complaint.updatedAt = Date.now();

    if (status === 'completed' && req.file) {
      const proofUrl = req.file.path || req.file.secure_url;
      complaint.proofImage = proofUrl;

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

    // Audit Log: STATUS_CHANGE
    recordAuditLog({
      req,
      action: 'STATUS_CHANGE',
      resource: 'Complaint',
      resourceId: complaint._id,
      target: { title: complaint.title, identifier: complaint._id.toString() },
      description: `${req.user.role.toUpperCase()} "${req.user.name}" shifted status of "${complaint.title}" from "${previousStatus}" to "${status}"`,
      details: {
        previousStatus,
        newStatus: status,
        hasProofImage: !!req.file
      }
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or Citizen Owner)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only admin or the author can delete
    if (req.user.role !== 'admin' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    await Assignment.deleteMany({ complaintId: req.params.id });

    // Audit Log: DELETE Complaint
    recordAuditLog({
      req,
      action: 'DELETE',
      resource: 'Complaint',
      resourceId: req.params.id,
      target: { title: complaint.title, identifier: req.params.id },
      description: `${req.user.role.toUpperCase()} "${req.user.name}" permanently deleted complaint "${complaint.title}"`,
      details: {
        title: complaint.title,
        category: complaint.category,
        location: complaint.location?.address
      }
    });

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus,
  deleteComplaint
};