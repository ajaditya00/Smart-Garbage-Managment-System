import express from 'express';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Donation from '../models/Donation.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// @route  GET /api/public/stats
// @desc   Public platform statistics for landing page (no auth)
// @access Public
router.get('/stats', async (req, res) => {
  try {
    const [
      totalComplaints,
      completedComplaints,
      totalUsers,
      donations,
      avgRatingArr,
      recentComplaints
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['completed', 'verified'] } }),
      User.countDocuments(),
      Donation.find({ status: { $in: ['success', 'paid'] } }).select('amount'),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Complaint.find()
        .populate('userId', 'name')
        .select('location status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const resolutionRate = totalComplaints > 0
      ? ((completedComplaints / totalComplaints) * 100).toFixed(0)
      : 0;
    const avgRating = avgRatingArr.length > 0 ? avgRatingArr[0].avg.toFixed(1) : '5.0';

    res.json({
      totalComplaints,
      completedComplaints,
      totalUsers,
      totalDonations,
      resolutionRate,
      avgRating,
      recentComplaints: recentComplaints.map(c => ({
        _id: c._id,
        address: c.location?.address || 'Unknown Location',
        status: c.status,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
