import api from "./api";

export async function searchDocuments(query, filter = "all") {
  const res = await api.get("/search", {
    params: { q: query, filter },
  });
  return res.data;
}
