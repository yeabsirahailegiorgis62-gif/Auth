const shareService = require("../services/share.service");

class ShareController {
  async shareDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required to share document",
        });
      }

      const share = await shareService.shareDocument({
        documentId: id,
        requestingUserId: req.user.id,
        targetEmail: email,
        role,
      });

      return res.status(201).json({
        success: true,
        message: `Document shared with ${share.user.email} as ${share.role}`,
        share,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollaborators(req, res, next) {
    try {
      const { id } = req.params;
      const collaborators = await shareService.getCollaborators(id, req.user.id);

      return res.json({
        success: true,
        collaborators,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCollaboratorRole(req, res, next) {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      const updatedShare = await shareService.updateCollaboratorRole({
        documentId: id,
        requestingUserId: req.user.id,
        targetUserId: parseInt(userId, 10),
        newRole: role,
      });

      return res.json({
        success: true,
        message: "Collaborator role updated successfully",
        share: updatedShare,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCollaborator(req, res, next) {
    try {
      const { id, userId } = req.params;

      const result = await shareService.removeCollaborator({
        documentId: id,
        requestingUserId: req.user.id,
        targetUserId: parseInt(userId, 10),
      });

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShareController();
