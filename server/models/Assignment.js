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

export default mongoose.model('Assignment', assignmentSchema);