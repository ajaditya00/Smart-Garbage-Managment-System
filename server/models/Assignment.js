import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigneeType: {
    type: String,
    enum: ['employee', 'ngo'],
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  proofImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Database indexes for fast querying, assignment lookups, and task tracking
assignmentSchema.index({ complaintId: 1 });
assignmentSchema.index({ assigneeId: 1, createdAt: -1 });
assignmentSchema.index({ complaintId: 1, assigneeId: 1 });

export default mongoose.model('Assignment', assignmentSchema);