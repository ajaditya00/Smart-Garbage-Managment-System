const express = require('express');
const { body } = require('express-validator');
const { createFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const feedbackValidation = [
  body('complaintId').isMongoId().withMessage('Invalid complaint ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
];

router.post('/', protect, authorize('citizen'), feedbackValidation, createFeedback);
router.get('/:complaintId', protect, getFeedback);

module.exports = router;