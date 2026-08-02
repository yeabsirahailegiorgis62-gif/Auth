const revisionService = require("../services/revision.service");
const { getIO } = require("../socket/socket.server");
const SOCKET_EVENTS = require("../socket/events");

class RevisionController {
  async getTimeline(req, res, next) {
    try {
      const { documentId } = req.params;
      const revisions = await revisionService.getTimeline(documentId, req.user.id);

      res.status(200).json({
        success: true,
        revisions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevisionById(req, res, next) {
    try {
      const { documentId, revisionId } = req.params;
      const revision = await revisionService.getRevisionById(
        documentId,
        revisionId,
        req.user.id
      );

      res.status(200).json({
        success: true,
        revision,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCheckpoint(req, res, next) {
    try {
      const { documentId } = req.params;
      const revision = await revisionService.createCheckpoint(
        documentId,
        req.user.id
      );

      res.status(201).json({
        success: true,
        revision,
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreRevision(req, res, next) {
    try {
      const { documentId, revisionId } = req.params;
      const result = await revisionService.restoreRevision(
        documentId,
        revisionId,
        req.user.id
      );

      // Broadcast real-time restoration to all room collaborators
      try {
        const io = getIO();
        io.in(`document:${documentId}`).emit(SOCKET_EVENTS.REVISION_RESTORED, {
          documentId,
          restoredBy: req.user.id,
          restoredFromVersion: result.restoredFromVersion,
          newRevision: result.newRevision,
          document: result.document,
        });
      } catch (err) {
        console.warn(`[Revision Controller] Socket broadcast failed: ${err.message}`);
      }

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RevisionController();
