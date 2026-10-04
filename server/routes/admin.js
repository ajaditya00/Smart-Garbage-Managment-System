import express from 'express';
import { body } from 'express-validator';
import { 
  assignComplaint, 
  getUsersByRole, 
  getDashboardStats, 
  getAllDonations, 
  verifyComplaint, 
  rejectComplaint,
  deleteUser,
  updateUserRole
} from '../controllers/adminController.js';
import {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogs
} from '../controllers/auditLogController.js';
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
router.get('/donations', protect, authorize('admin'), getAllDonations);
router.put('/verify/:id', protect, authorize('admin'), verifyComplaint);
router.put('/reject/:id', protect, authorize('admin'), rejectComplaint);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

// Audit Log endpoints (Admin only)
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);
router.get('/audit-logs/stats', protect, authorize('admin'), getAuditLogStats);
router.get('/audit-logs/export', protect, authorize('admin'), exportAuditLogs);

export default router;