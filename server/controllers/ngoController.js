import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';

// @desc    Get available and assigned tasks for NGO
// @route   GET /api/ngo/tasks
// @access  Private (NGO)
const getTasks = async (req, res) => {
  try {
    // Get assigned tasks
    const assignedTasks = await Complaint.find({
      assignedTo: req.user._id,
      assignedType: 'ngo'
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    // Get available tasks (pending complaints)
    const availableTasks = await Complaint.find({
      status: 'pending'
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      assignedTasks,
      availableTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a complaint task
// @route   PUT /api/ngo/accept/:complaintId
// @access  Private (NGO)
const acceptTask = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'pending') {
      return res.status(400).json({ message: 'Complaint is not available for assignment' });
    }

    // Update complaint
    complaint.assignedTo = req.user._id;
    complaint.assignedType = 'ngo';
    complaint.status = 'assigned';
    complaint.updatedAt = Date.now();

    await complaint.save();

    // Create assignment record
    await Assignment.create({
      complaintId: complaint._id,
      assigneeId: req.user._id,
      assigneeType: 'ngo'
    });

    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name role');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getTasks,
  acceptTask
};