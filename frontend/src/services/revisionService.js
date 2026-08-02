import api from "./api";

export async function getRevisions(documentId) {
  const res = await api.get(`/documents/${documentId}/revisions`);
  return res.data;
}

export async function getRevisionById(documentId, revisionId) {
  const res = await api.get(`/documents/${documentId}/revisions/${revisionId}`);
  return res.data;
}

export async function createCheckpoint(documentId) {
  const res = await api.post(`/documents/${documentId}/revisions/snapshot`);
  return res.data;
}

export async function restoreRevision(documentId, revisionId) {
  const res = await api.post(`/documents/${documentId}/revisions/${revisionId}/restore`);
  return res.data;
}
