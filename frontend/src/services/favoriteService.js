import api from "./api";

export async function addFavorite(documentId) {
  const res = await api.post(`/documents/${documentId}/favorite`);
  return res.data;
}

export async function removeFavorite(documentId) {
  const res = await api.delete(`/documents/${documentId}/favorite`);
  return res.data;
}

export async function getFavorites() {
  const res = await api.get("/user/favorites");
  return res.data;
}
