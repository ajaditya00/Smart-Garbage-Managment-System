import AuditLog from '../models/AuditLog.js';

// @desc    Get paginated audit logs with search and filtering
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { action, resource, search, status, startDate, endDate } = req.query;

    let query = {};

    if (action && action !== 'all') {
      query.action = action.toUpperCase();
    }

    if (resource && resource !== 'all') {
      query.resource = resource;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'actor.name': regex },
        { 'actor.email': regex },
        { 'actor.role': regex },
        { description: regex },
        { resourceId: regex },
        { 'target.title': regex },
        { ipAddress: regex }
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
  }
};

// @desc    Get audit log statistics and activity breakdown
// @route   GET /api/admin/audit-logs/stats
// @access  Private (Admin only)
export const getAuditLogStats = async (req, res) => {
  try {
    const totalLogs = await AuditLog.countDocuments();

    // Group by action (CREATE, UPDATE, DELETE, etc.)
    const actionCountsRaw = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    const actionCounts = actionCountsRaw.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Group by resource (Complaint, User, Assignment, Donation, etc.)
    const resourceCountsRaw = await AuditLog.aggregate([
      { $group: { _id: '$resource', count: { $sum: 1 } } }
    ]);
    const resourceCounts = resourceCountsRaw.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Daily activity for the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyActivity = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          creates: { $sum: { $cond: [{ $eq: ['$action', 'CREATE'] }, 1, 0] } },
          updates: { $sum: { $cond: [{ $eq: ['$action', 'UPDATE'] }, 1, 0] } },
          deletes: { $sum: { $cond: [{ $eq: ['$action', 'DELETE'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most active actors
    const topActors = await AuditLog.aggregate([
      {
        $group: {
          _id: '$actor.email',
          name: { $first: '$actor.name' },
          role: { $first: '$actor.role' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalLogs,
        actionCounts: {
          CREATE: actionCounts.CREATE || 0,
          UPDATE: actionCounts.UPDATE || 0,
          DELETE: actionCounts.DELETE || 0,
          STATUS_CHANGE: actionCounts.STATUS_CHANGE || 0,
          ASSIGN: actionCounts.ASSIGN || 0,
          LOGIN: actionCounts.LOGIN || 0
        },
        resourceCounts,
        dailyActivity,
        topActors
      }
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({ message: 'Failed to fetch audit log stats', error: error.message });
  }
};

// @desc    Export audit logs in CSV or JSON
// @route   GET /api/admin/audit-logs/export
// @access  Private (Admin only)
export const exportAuditLogs = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(1000).lean();

    if (format === 'csv') {
      const headers = ['Timestamp', 'Action', 'Resource', 'Resource ID', 'Actor Name', 'Actor Email', 'Actor Role', 'Description', 'IP Address', 'Status'];
      const rows = logs.map(l => [
        `"${new Date(l.createdAt).toISOString()}"`,
        `"${l.action}"`,
        `"${l.resource}"`,
        `"${l.resourceId || ''}"`,
        `"${(l.actor?.name || '').replace(/"/g, '""')}"`,
        `"${l.actor?.email || ''}"`,
        `"${l.actor?.role || ''}"`,
        `"${(l.description || '').replace(/"/g, '""')}"`,
        `"${l.ipAddress || ''}"`,
        `"${l.status || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="swachh-ai-audit-logs.csv"');
      return res.status(200).send(csvContent);
    }

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
