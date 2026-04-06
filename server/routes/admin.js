import express from 'express';
import { body } from 'express-validator';
import { assignComplaint, getUsersByRole, getDashboardStats } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

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

export default router;