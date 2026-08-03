const commentRepository = require("../repositories/comment.repository");
const permissionService = require("./permission.service");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

class CommentService {
  async getThreads(documentId, userId, options = {}) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.READ
    );
    return commentRepository.findThreadsByDocument(documentId, options);
  }

  async createThread(documentId, userId, { selectedText, fromPos, toPos, content }) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.COMMENT
    );

    if (!content || !content.trim()) {
      throw new AppError("Comment content is required", 400);
    }

    return commentRepository.createThread({
      documentId,
      createdBy: userId,
      selectedText,
      fromPos,
      toPos,
      content,
    });
  }

  async addReply(documentId, threadId, userId, content) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.COMMENT
    );

    if (!content || !content.trim()) {
      throw new AppError("Reply content is required", 400);
    }

    const thread = await commentRepository.findThreadById(threadId);
    if (!thread || thread.documentId !== documentId) {
      throw new AppError("Comment thread not found", 404);
    }

    return commentRepository.addReply({
      threadId,
      authorId: userId,
      content,
    });
  }

  async updateComment(documentId, commentId, userId, content) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.COMMENT
    );

    if (!content || !content.trim()) {
      throw new AppError("Comment content is required", 400);
    }

    const comment = await commentRepository.findCommentById(commentId);
    if (!comment || comment.thread.documentId !== documentId) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.authorId !== userId) {
      throw new AppError("Forbidden: You can only edit your own comments", 403);
    }

    return commentRepository.updateComment(commentId, content);
  }

  async deleteComment(documentId, commentId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.COMMENT
    );

    const comment = await commentRepository.findCommentById(commentId);
    if (!comment || comment.thread.documentId !== documentId) {
      throw new AppError("Comment not found", 404);
    }

    const isAuthor = comment.authorId === userId;
    const isDocOwner = comment.thread.document.ownerId === userId;

    if (!isAuthor && !isDocOwner) {
      throw new AppError("Forbidden: You can only delete your own comments", 403);
    }

    return commentRepository.deleteComment(commentId);
  }

  async resolveThread(documentId, threadId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.COMMENT
    );

    const thread = await commentRepository.findThreadById(threadId);
    if (!thread || thread.documentId !== documentId) {
      throw new AppError("Comment thread not found", 404);
    }

    return commentRepository.updateThreadStatus(threadId, {
      resolved: true,
      resolvedById: userId,
    });
  }

  async reopenThread(documentId, threadId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.COMMENT
    );

    const thread = await commentRepository.findThreadById(threadId);
    if (!thread || thread.documentId !== documentId) {
      throw new AppError("Comment thread not found", 404);
    }

    return commentRepository.updateThreadStatus(threadId, {
      resolved: false,
      resolvedById: null,
    });
  }
}

module.exports = new CommentService();
