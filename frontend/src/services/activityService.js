import api from "./api";

export async function getUserActivities() {
  const res = await api.get("/activity");
  return res.data;
}
