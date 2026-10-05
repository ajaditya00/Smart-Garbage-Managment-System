import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Database indexes for fast lookups, payment verification, and user history
donationSchema.index({ razorpayOrderId: 1 }, { unique: true });
donationSchema.index({ userId: 1, status: 1 });
donationSchema.index({ userId: 1, createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

export default mongoose.model('Donation', donationSchema);