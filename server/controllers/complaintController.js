const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { location, category, description } = req.body;
    const locationData = JSON.parse(location);

    const complaint = await Complaint.create({
      userId: req.user._id,
      image: req.file.path,
      location: locationData,
      category,
      description
    });

    await complaint.populate('userId', 'name email');

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaints
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

    if ((req.user.role === 'employee' || req.user.role === 'ngo') && 
        complaint.assignedTo && complaint.assignedTo._id.toString() !== req.user._id.toString()) {
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

    // Check if user is assigned to this complaint
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    complaint.status = status;
    complaint.updatedAt = Date.now();

    if (status === 'completed' && req.file) {
      // Update assignment with proof image
      await Assignment.findOneAndUpdate(
        { complaintId: complaint._id, assigneeId: req.user._id },
        { 
          proofImage: req.file.path,
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

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus
};