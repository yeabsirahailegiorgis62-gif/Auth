import api from "./api";

export async function getDocuments(params = {}) {
  const response = await api.get("/documents", { params });
  return response.data;
}

export async function createDocument(data = {}) {
  const response = await api.post("/documents", data);
  return response.data;
}

export async function getDocumentById(id) {
  const response = await api.get(`/documents/${id}`);
  return response.data;
}

export async function updateDocument(id, data) {
  const response = await api.patch(`/documents/${id}`, data);
  return response.data;
}

export async function deleteDocument(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
}

export async function restoreDocument(id) {
  const response = await api.post(`/documents/${id}/restore`);
  return response.data;
}

export async function permanentDeleteDocument(id) {
  const response = await api.delete(`/documents/${id}/permanent`);
  return response.data;
}

export async function duplicateDocument(id) {
  const response = await api.post(`/documents/${id}/duplicate`);
  return response.data;
}

// Document Sharing & Collaborators API
export async function shareDocument(id, email, role = "VIEWER") {
  const response = await api.post(`/documents/${id}/share`, { email, role });
  return response.data;
}

export async function getCollaborators(id) {
  const response = await api.get(`/documents/${id}/collaborators`);
  return response.data;
}

export async function updateCollaboratorRole(id, userId, role) {
  const response = await api.patch(`/documents/${id}/collaborators/${userId}`, { role });
  return response.data;
}

export async function removeCollaborator(id, userId) {
  const response = await api.delete(`/documents/${id}/collaborators/${userId}`);
  return response.data;
}

export async function searchUsers(query) {
  const response = await api.get("/user/search", { params: { q: query } });
  return response.data;
}


