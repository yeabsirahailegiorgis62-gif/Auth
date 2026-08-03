const activityRepository = require("../repositories/activity.repository");
const logger = require("../config/logger");

class ActivityService {
  async logActivity(userId, documentId, action, metadata = null) {
    try {
      return await activityRepository.create({
        userId,
        documentId,
        action,
        metadata,
      });
    } catch (err) {
      logger.warn(`[Activity Log Failed]: ${err.message}`);
    }
  }

  async getUserActivities(userId, limit = 20) {
    const logs = await activityRepository.findByUserId(userId, limit);
    return logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  }
}

module.exports = new ActivityService();
