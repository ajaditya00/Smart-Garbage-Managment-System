import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Database indexes for fast querying and duplicate prevention
feedbackSchema.index({ complaintId: 1, userId: 1 }, { unique: true });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);