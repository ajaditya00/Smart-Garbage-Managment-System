import AuditLog from '../models/AuditLog.js';

/**
 * Extracts client IP address from Express request
 */
export const getClientIp = (req) => {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

/**
 * Record an audit log entry safely (non-blocking)
 * @param {Object} params
 * @param {import('express').Request} [params.req] - Express request object
 * @param {Object} [params.user] - User object (falls back to req.user)
 * @param {'CREATE'|'READ'|'UPDATE'|'DELETE'|'STATUS_CHANGE'|'ASSIGN'|'LOGIN'|'LOGOUT'} params.action
 * @param {'Complaint'|'User'|'Assignment'|'Donation'|'Feedback'|'Auth'|'System'} params.resource
 * @param {string|Object} [params.resourceId]
 * @param {string} params.description
 * @param {Object} [params.target] - Info about target item
 * @param {Object} [params.details] - Detailed changes / payload
 * @param {'success'|'failed'|'warning'} [params.status='success']
 */
export const recordAuditLog = async ({
  req,
  user,
  action,
  resource,
  resourceId,
  description,
  target,
  details = {},
  status = 'success'
}) => {
  try {
    const actorUser = user || req?.user || null;
    const ipAddress = getClientIp(req);
    const userAgent = req?.headers ? (req.headers['user-agent'] || 'Unknown') : 'Unknown';

    const actor = {
      id: actorUser?._id ? actorUser._id.toString() : null,
      name: actorUser?.name || 'Anonymous / Guest',
      email: actorUser?.email || 'guest@swachh.ai',
      role: actorUser?.role || 'guest'
    };

    const logEntry = new AuditLog({
      action,
      resource,
      resourceId: resourceId ? resourceId.toString() : null,
      user: actorUser?._id || null,
      actor,
      target: {
        title: target?.title || null,
        name: target?.name || null,
        identifier: target?.identifier || (resourceId ? resourceId.toString() : null)
      },
      description,
      details,
      ipAddress,
      userAgent,
      status
    });

    await logEntry.save();
    return logEntry;
  } catch (err) {
    // Audit logging should never bring down the primary API response
    console.error('[AuditLog] Failed to record audit log:', err.message);
    return null;
  }
};

export default recordAuditLog;
