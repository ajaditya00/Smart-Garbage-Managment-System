const express = require('express');
const { body } = require('express-validator');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const complaintValidation = [
  body('category').isIn(['household', 'industrial', 'public', 'other']).withMessage('Invalid category'),
  body('description').notEmpty().isLength({ max: 500 }).withMessage('Description is required and must be less than 500 characters')
];

const statusValidation = [
  body('status').isIn(['pending', 'assigned', 'in-progress', 'completed']).withMessage('Invalid status')
];

router.post('/', protect, authorize('citizen'), upload.single('image'), complaintValidation, createComplaint);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaint);
router.put('/:id/status', protect, authorize('employee', 'ngo'), upload.single('proofImage'), statusValidation, updateComplaintStatus);

module.exports = router;