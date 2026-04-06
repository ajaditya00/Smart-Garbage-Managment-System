import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import Feedback from '../models/Feedback.js';

// @desc    Assign complaint to employee or NGO
// @route   POST /api/admin/assign
// @access  Private (Admin)
const assignComplaint = async (req, res) => {
  try {
    const { complaintId, assigneeId, assigneeType } = req.body;

    const complaint = await Complaint.findById(complaintId);
    const assignee = await User.findById(assigneeId);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!assignee) {
      return res.status(404).json({ message: 'Assignee not found' });
    }

    if (assignee.role !== assigneeType) {
      return res.status(400).json({ message: 'Assignee role does not match assignment type' });
    }

    // Update complaint
    complaint.assignedTo = assigneeId;
    complaint.assignedType = assigneeType;
    complaint.status = 'assigned';
    complaint.updatedAt = Date.now();

    await complaint.save();

    // Create assignment record
    await Assignment.create({
      complaintId,
      assigneeId,
      assigneeType
    });

    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name role');

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users by role
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const assignedComplaints = await Complaint.countDocuments({ status: 'assigned' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const completedComplaints = await Complaint.countDocuments({ status: 'completed' });

    const totalUsers = await User.countDocuments();
    const citizenCount = await User.countDocuments({ role: 'citizen' });
    const employeeCount = await User.countDocuments({ role: 'employee' });
    const ngoCount = await User.countDocuments({ role: 'ngo' });

    const totalFeedback = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate('userId', 'name email')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    // Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly complaints (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyComplaints = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      overview: {
        totalComplaints,
        pendingComplaints,
        assignedComplaints,
        inProgressComplaints,
        completedComplaints,
        resolutionRate: totalComplaints > 0 ? ((completedComplaints / totalComplaints) * 100).toFixed(1) : 0
      },
      users: {
        totalUsers,
        citizenCount,
        employeeCount,
        ngoCount
      },
      feedback: {
        totalFeedback,
        averageRating: avgRating.length > 0 ? avgRating[0].averageRating.toFixed(1) : 0
      },
      recentComplaints,
      complaintsByCategory,
      monthlyComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  assignComplaint,
  getUsersByRole,
  getDashboardStats
};