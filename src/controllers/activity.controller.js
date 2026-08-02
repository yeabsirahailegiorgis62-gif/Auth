const activityService = require("../services/activity.service");

class ActivityController {
  async getUserActivities(req, res, next) {
    try {
      const activities = await activityService.getUserActivities(req.user.id);
      res.status(200).json({
        success: true,
        activities,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ActivityController();
