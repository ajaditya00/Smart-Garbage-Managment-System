import express from 'express';
import { body } from 'express-validator';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Validation middleware
const complaintValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('category')
    .isIn(['garbage', 'sewage', 'road', 'electricity', 'water', 'household', 'industrial', 'public', 'other'])
    .withMessage('Invalid category'),
  body('description')
    .notEmpty()
    .isLength({ max: 500 })
    .withMessage('Description is required and must be less than 500 characters')
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'assigned', 'in-progress', 'completed', 'verified'])
    .withMessage('Invalid status')
];

router.post('/', protect, authorize('citizen'), upload.single('image'), complaintValidation, createComplaint);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaint);
router.put('/:id/status', protect, authorize('employee', 'ngo'), upload.single('proofImage'), statusValidation, updateComplaintStatus);

export default router;