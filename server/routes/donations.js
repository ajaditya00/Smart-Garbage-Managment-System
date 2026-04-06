import express from 'express';
import { body } from 'express-validator';
import { createOrder, verifyPayment, getDonationHistory, getDonationStats } from '../controllers/donationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const orderValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number')
];

const verifyValidation = [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
];

router.post('/create-order', protect, orderValidation, createOrder);
router.post('/verify', protect, verifyValidation, verifyPayment);
router.get('/history', protect, getDonationHistory);
router.get('/stats', protect, getDonationStats);

export default router;