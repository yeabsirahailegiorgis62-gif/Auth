const notificationRepository = require("../repositories/notification.repository");

class NotificationService {
  async createNotification(userId, documentId, type, message) {
    try {
      return await notificationRepository.create({
        userId,
        documentId,
        type,
        message,
      });
    } catch (err) {
      console.warn(`[Notification Create Failed]: ${err.message}`);
    }
  }

  async getUserNotifications(userId) {
    return notificationRepository.findByUserId(userId);
  }

  async markAsRead(id, userId) {
    return notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }
}

module.exports = new NotificationService();
