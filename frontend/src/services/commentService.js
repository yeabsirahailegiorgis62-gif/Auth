import api from "./api";

export async function getThreads(documentId, status = "all") {
  const res = await api.get(`/documents/${documentId}/comments`, {
    params: { status },
  });
  return res.data;
}

export async function createThread(documentId, data) {
  const res = await api.post(`/documents/${documentId}/comments`, data);
  return res.data;
}

export async function addReply(documentId, threadId, content) {
  const res = await api.post(`/documents/${documentId}/comments/${threadId}/reply`, {
    content,
  });
  return res.data;
}

export async function updateComment(documentId, commentId, content) {
  const res = await api.patch(`/documents/${documentId}/comments/item/${commentId}`, {
    content,
  });
  return res.data;
}

export async function deleteComment(documentId, commentId) {
  const res = await api.delete(`/documents/${documentId}/comments/item/${commentId}`);
  return res.data;
}

export async function resolveThread(documentId, threadId) {
  const res = await api.patch(`/documents/${documentId}/comments/${threadId}/resolve`);
  return res.data;
}

export async function reopenThread(documentId, threadId) {
  const res = await api.patch(`/documents/${documentId}/comments/${threadId}/reopen`);
  return res.data;
}
