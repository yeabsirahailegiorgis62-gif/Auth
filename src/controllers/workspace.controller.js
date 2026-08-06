const workspaceService = require('../services/workspace.service');

class WorkspaceController {
  async createWorkspace(req, res, next) {
    try {
      const { name, description, color, logoUrl } = req.body;
      const workspace = await workspaceService.createWorkspace(req.user.id, {
        name,
        description,
        color,
        logoUrl,
      });
      res.status(201).json({ success: true, workspace });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspace(req, res, next) {
    try {
      const result = await workspaceService.getWorkspace(req.user.id, req.params.workspaceId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getUserWorkspaces(req, res, next) {
    try {
      const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
      res.json({ success: true, workspaces });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspace(req, res, next) {
    try {
      const { name, description, color, logoUrl } = req.body;
      const workspace = await workspaceService.updateWorkspace(req.user.id, req.params.workspaceId, {
        name,
        description,
        color,
        logoUrl,
      });
      res.json({ success: true, workspace });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkspace(req, res, next) {
    try {
      await workspaceService.deleteWorkspace(req.user.id, req.params.workspaceId);
      res.json({ success: true, message: 'Workspace deleted' });
    } catch (error) {
      next(error);
    }
  }

  async inviteUser(req, res, next) {
    try {
      const { email, role } = req.body;
      const result = await workspaceService.inviteUser(req.user.id, req.params.workspaceId, email, role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req, res, next) {
    try {
      const { token } = req.body;
      const result = await workspaceService.acceptInvitation(req.user.id, token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req, res, next) {
    try {
      const { role } = req.body;
      const member = await workspaceService.updateMemberRole(req.user.id, req.params.workspaceId, req.params.userId, role);
      res.json({ success: true, member });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      await workspaceService.removeMember(req.user.id, req.params.workspaceId, req.params.userId);
      res.json({ success: true, message: 'Member removed' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkspaceController();
