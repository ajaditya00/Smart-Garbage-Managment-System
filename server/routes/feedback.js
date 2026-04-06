import express from 'express';
import { body } from 'express-validator';
import { createFeedback, getFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const feedbackValidation = [
  body('complaintId').isMongoId().withMessage('Invalid complaint ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
];

router.post('/', protect, authorize('citizen'), feedbackValidation, createFeedback);
router.get('/:complaintId', protect, getFeedback);

export default router;