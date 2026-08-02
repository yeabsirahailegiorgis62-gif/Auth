const commentService = require("../services/comment.service");

class CommentController {
  async getThreads(req, res, next) {
    try {
      const { documentId } = req.params;
      const { status } = req.query; // 'open' | 'resolved' | 'all'
      const threads = await commentService.getThreads(documentId, req.user.id, { status });

      res.status(200).json({
        success: true,
        threads,
      });
    } catch (error) {
      next(error);
    }
  }

  async createThread(req, res, next) {
    try {
      const { documentId } = req.params;
      const { selectedText, fromPos, toPos, content } = req.body;

      const thread = await commentService.createThread(documentId, req.user.id, {
        selectedText,
        fromPos,
        toPos,
        content,
      });

      res.status(201).json({
        success: true,
        thread,
      });
    } catch (error) {
      next(error);
    }
  }

  async addReply(req, res, next) {
    try {
      const { documentId, threadId } = req.params;
      const { content } = req.body;

      const comment = await commentService.addReply(
        documentId,
        threadId,
        req.user.id,
        content
      );

      res.status(201).json({
        success: true,
        comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { documentId, commentId } = req.params;
      const { content } = req.body;

      const comment = await commentService.updateComment(
        documentId,
        commentId,
        req.user.id,
        content
      );

      res.status(200).json({
        success: true,
        comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const { documentId, commentId } = req.params;
      const result = await commentService.deleteComment(
        documentId,
        commentId,
        req.user.id
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveThread(req, res, next) {
    try {
      const { documentId, threadId } = req.params;
      const thread = await commentService.resolveThread(
        documentId,
        threadId,
        req.user.id
      );

      res.status(200).json({
        success: true,
        thread,
      });
    } catch (error) {
      next(error);
    }
  }

  async reopenThread(req, res, next) {
    try {
      const { documentId, threadId } = req.params;
      const thread = await commentService.reopenThread(
        documentId,
        threadId,
        req.user.id
      );

      res.status(200).json({
        success: true,
        thread,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
