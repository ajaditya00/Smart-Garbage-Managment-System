const express = require('express');
const { body } = require('express-validator');
const {
  assignComplaint,
  getUsersByRole,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const assignValidation = [
  body('complaintId').isMongoId().withMessage('Invalid complaint ID'),
  body('assigneeId').isMongoId().withMessage('Invalid assignee ID'),
  body('assigneeType').isIn(['employee', 'ngo']).withMessage('Invalid assignee type')
];

router.post('/assign', protect, authorize('admin'), assignValidation, assignComplaint);
router.get('/users', protect, authorize('admin'), getUsersByRole);
router.get('/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;