const folderService = require('../services/folder.service');

class FolderController {
  async createFolder(req, res, next) {
    try {
      const { name, parentId } = req.body;
      const folder = await folderService.createFolder(req.user.id, req.params.workspaceId, name, parentId);
      res.status(201).json({ success: true, folder });
    } catch (error) {
      next(error);
    }
  }

  async getFolder(req, res, next) {
    try {
      const folder = await folderService.getFolder(req.user.id, req.params.workspaceId, req.params.folderId);
      res.json({ success: true, folder });
    } catch (error) {
      next(error);
    }
  }

  async getRootFolders(req, res, next) {
    try {
      const folders = await folderService.getRootFolders(req.user.id, req.params.workspaceId);
      res.json({ success: true, folders });
    } catch (error) {
      next(error);
    }
  }

  async renameFolder(req, res, next) {
    try {
      const { name } = req.body;
      const folder = await folderService.renameFolder(req.user.id, req.params.workspaceId, req.params.folderId, name);
      res.json({ success: true, folder });
    } catch (error) {
      next(error);
    }
  }

  async moveFolder(req, res, next) {
    try {
      const { parentId } = req.body;
      const folder = await folderService.moveFolder(req.user.id, req.params.workspaceId, req.params.folderId, parentId);
      res.json({ success: true, folder });
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req, res, next) {
    try {
      await folderService.deleteFolder(req.user.id, req.params.workspaceId, req.params.folderId);
      res.json({ success: true, message: 'Folder deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FolderController();
