const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity & audit logs
// @route   GET /api/activity-logs
const getActivityLogs = async (req, res, next) => {
  try {
    const { entityType, limit = 50 } = req.query;
    const query = { companyId: req.companyId };

    if (entityType && entityType !== 'All') {
      query.entityType = entityType;
    }

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivityLogs };
