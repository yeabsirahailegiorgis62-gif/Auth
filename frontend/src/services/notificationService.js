import api from "./api";

export async function getNotifications() {
  const res = await api.get("/notifications");
  return res.data;
}

export async function markNotificationAsRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await api.post("/notifications/read-all");
  return res.data;
}
