const express = require('express');
const { body } = require('express-validator');
const { createOrder, verifyPayment } = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be a positive number')
];

const verifyValidation = [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
];

router.post('/create-order', protect, orderValidation, createOrder);
router.post('/verify', protect, verifyValidation, verifyPayment);

module.exports = router;