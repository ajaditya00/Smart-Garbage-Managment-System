import { validationResult } from 'express-validator';
import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private (Citizen)
const createFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { complaintId, rating, comment } = req.body;

    // Check if complaint exists and is completed
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (complaint.status !== 'completed' && complaint.status !== 'verified') {
      return res.status(400).json({ message: 'Can only provide feedback for completed or verified complaints' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      complaintId,
      userId: req.user._id
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already provided for this complaint' });
    }

    const feedback = await Feedback.create({
      complaintId,
      userId: req.user._id,
      rating,
      comment
    });

    // Update complaint with feedback for easy admin access
    complaint.feedbackRating = rating;
    complaint.feedbackComment = comment;
    await complaint.save();

    await feedback.populate('userId', 'name email');
    await feedback.populate('complaintId', 'description category');

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback for a complaint
// @route   GET /api/feedback/:complaintId
// @access  Private
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ complaintId: req.params.complaintId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createFeedback,
  getFeedback
};