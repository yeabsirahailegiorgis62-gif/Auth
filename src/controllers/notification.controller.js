const notificationService = require("../services/notification.service");

class NotificationController {
  async getUserNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.id);
      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id, req.user.id);
      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
