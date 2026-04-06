import Razorpay from 'razorpay';
import crypto from 'crypto';
import Donation from '../models/Donation.js';

let razorpay = null;

const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// @desc    Create donation order
// @route   POST /api/donate/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // amount from client is in paise already (frontend multiplies by 100)
    // If it's less than 100, assume it's rupees and convert
    const amountInPaise = amount < 100 ? amount * 100 : amount;
    const amountInRupees = Math.round(amountInPaise / 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const rp = getRazorpay();
    const order = await rp.orders.create(options);

    // Save pending donation record
    const donation = await Donation.create({
      userId: req.user._id,
      amount: amountInRupees,
      razorpayOrderId: order.id,
      status: 'created'
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      donation
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/donate/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const donation = await Donation.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { razorpayPaymentId: razorpay_payment_id, status: 'paid' },
        { new: true }
      ).populate('userId', 'name email');

      res.json({ message: 'Payment verified successfully', donation });
    } else {
      await Donation.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      res.status(400).json({ message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user donation history
// @route   GET /api/donate/history
// @access  Private
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user donation stats
// @route   GET /api/donate/stats
// @access  Private
const getDonationStats = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id, status: 'paid' });
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    res.json({
      totalDonated,
      donationCount: donations.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createOrder, verifyPayment, getDonationHistory, getDonationStats };