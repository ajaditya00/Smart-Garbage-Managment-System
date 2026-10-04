import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'ASSIGN', 'LOGIN', 'LOGOUT'],
      index: true
    },
    resource: {
      type: String,
      required: true,
      enum: ['Complaint', 'User', 'Assignment', 'Donation', 'Feedback', 'Auth', 'System'],
      index: true
    },
    resourceId: {
      type: String,
      default: null,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    actor: {
      id: { type: String, default: null },
      name: { type: String, default: 'Anonymous / System' },
      email: { type: String, default: 'system@swachh.ai' },
      role: { type: String, default: 'system' }
    },
    target: {
      title: { type: String, default: null },
      name: { type: String, default: null },
      identifier: { type: String, default: null }
    },
    description: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'warning'],
      default: 'success'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering in Admin Dashboard
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, resource: 1, createdAt: -1 });
auditLogSchema.index({ 'actor.email': 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
