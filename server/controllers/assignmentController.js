import Assignment from '../models/Assignment.js';
import Complaint from '../models/Complaint.js';

export const createAssignment = async (req, res) => {
  try {
    const { complaintId, assigneeId, assigneeType } = req.body;

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if already assigned
    const existingAssignment = await Assignment.findOne({ complaintId });
    if (existingAssignment) {
      return res.status(400).json({ message: 'Complaint already assigned' });
    }

    const assignment = await Assignment.create({
      complaintId,
      assigneeId,
      assigneeType,
      assignedBy: req.user._id
    });

    // Update complaint status
    complaint.status = 'assigned';
    await complaint.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('complaintId')
      .populate('assigneeId', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      query.assigneeId = req.user._id;
    }

    const assignments = await Assignment.find(query)
      .populate('complaintId')
      .populate('assigneeId', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the assignee
    if (assignment.assigneeId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.file) {
      assignment.proofImage = `/uploads/${req.file.filename}`;
      assignment.completedAt = new Date();
      
      // Update complaint status to completed
      await Complaint.findByIdAndUpdate(assignment.complaintId, {
        status: 'completed'
      });
    }

    if (notes) {
      assignment.notes = notes;
    }

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('complaintId')
      .populate('assigneeId', 'name email')
      .populate('assignedBy', 'name email');

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};