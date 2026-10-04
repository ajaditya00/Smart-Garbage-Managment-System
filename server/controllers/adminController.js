import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Assignment from '../models/Assignment.js';
import Feedback from '../models/Feedback.js';
import Donation from '../models/Donation.js';
import { recordAuditLog } from '../utils/auditLogger.js';

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
    const assignment = await Assignment.create({
      complaintId,
      assigneeId,
      assigneeType
    });

    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name role');

    // Audit Log: ASSIGN Complaint
    recordAuditLog({
      req,
      action: 'ASSIGN',
      resource: 'Complaint',
      resourceId: complaint._id,
      target: { title: complaint.title, name: assignee.name, identifier: complaint._id.toString() },
      description: `Admin "${req.user.name}" assigned complaint "${complaint.title}" to ${assigneeType.toUpperCase()} "${assignee.name}"`,
      details: {
        complaintId,
        assigneeId,
        assigneeName: assignee.name,
        assigneeType,
        assignmentId: assignment._id
      }
    });

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
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      completedComplaints,
      verifiedComplaints,
      rejectedComplaints,
      totalUsers,
      citizenCount,
      employeeCount,
      ngoCount,
      totalFeedback,
      avgRating,
      recentComplaints,
      complaintsByCategory,
      monthlyComplaints
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'assigned' }),
      Complaint.countDocuments({ status: 'in-progress' }),
      Complaint.countDocuments({ status: 'completed' }),
      Complaint.countDocuments({ status: 'verified' }),
      Complaint.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'ngo' }),
      Feedback.countDocuments(),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' }
          }
        }
      ]),
      Complaint.find()
        .populate('userId', 'name email')
        .populate('assignedTo', 'name role')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]),
      Complaint.aggregate([
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
      ])
    ]);

    res.json({
      overview: {
        totalComplaints,
        pendingComplaints,
        assignedComplaints,
        inProgressComplaints,
        completedComplaints,
        verifiedComplaints,
        rejectedComplaints,
        resolutionRate: totalComplaints > 0 ? (((completedComplaints + verifiedComplaints) / totalComplaints) * 100).toFixed(1) : 0
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

// @desc    Get all donations
// @route   GET /api/admin/donations
// @access  Private (Admin)
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify completed complaint
// @route   PUT /api/admin/verify/:id
// @access  Private (Admin)
const verifyComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    complaint.status = 'verified';
    complaint.updatedAt = Date.now();
    await complaint.save();

    // Audit Log: STATUS_CHANGE (verified)
    recordAuditLog({
      req,
      action: 'STATUS_CHANGE',
      resource: 'Complaint',
      resourceId: complaint._id,
      target: { title: complaint.title, identifier: complaint._id.toString() },
      description: `Admin "${req.user.name}" verified and accepted resolution for complaint "${complaint.title}"`,
      details: {
        previousStatus: 'completed',
        newStatus: 'verified'
      }
    });
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject completed complaint
// @route   PUT /api/admin/reject/:id
// @access  Private (Admin)
const rejectComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Status back to rejected
    complaint.status = 'rejected'; 
    complaint.assignedTo = null;
    complaint.assignedType = null;
    complaint.updatedAt = Date.now();
    await complaint.save();

    // Audit Log: STATUS_CHANGE (rejected)
    recordAuditLog({
      req,
      action: 'STATUS_CHANGE',
      resource: 'Complaint',
      resourceId: complaint._id,
      target: { title: complaint.title, identifier: complaint._id.toString() },
      description: `Admin "${req.user.name}" rejected cleanup submission for complaint "${complaint.title}" and reset assignments`,
      details: {
        previousStatus: 'completed',
        newStatus: 'rejected'
      }
    });
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Audit Log: DELETE User
    recordAuditLog({
      req,
      action: 'DELETE',
      resource: 'User',
      resourceId: req.params.id,
      target: { name: user.name, email: user.email, identifier: req.params.id },
      description: `Admin "${req.user.name}" deleted user account "${user.name}" (${user.email})`,
      details: {
        deletedUserId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'employee', 'ngo', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Audit Log: UPDATE User
    recordAuditLog({
      req,
      action: 'UPDATE',
      resource: 'User',
      resourceId: user._id,
      target: { name: user.name, email: user.email, identifier: user._id.toString() },
      description: `Admin "${req.user.name}" updated role of "${user.name}" from "${oldRole}" to "${role}"`,
      details: {
        userId: user._id,
        previousRole: oldRole,
        newRole: role
      }
    });

    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  assignComplaint,
  getUsersByRole,
  getDashboardStats,
  getAllDonations,
  verifyComplaint,
  rejectComplaint,
  deleteUser,
  updateUserRole
};