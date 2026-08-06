const tagService = require('../services/tag.service');

class TagController {
  async createTag(req, res, next) {
    try {
      const { name, color } = req.body;
      const tag = await tagService.createTag(req.user.id, req.params.workspaceId, name, color);
      res.status(201).json({ success: true, tag });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceTags(req, res, next) {
    try {
      const tags = await tagService.getWorkspaceTags(req.user.id, req.params.workspaceId);
      res.json({ success: true, tags });
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req, res, next) {
    try {
      await tagService.deleteTag(req.user.id, req.params.workspaceId, req.params.tagId);
      res.json({ success: true, message: 'Tag deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addTagToDocument(req, res, next) {
    try {
      const { documentId } = req.body;
      const docTag = await tagService.addTagToDocument(req.user.id, req.params.workspaceId, documentId, req.params.tagId);
      res.json({ success: true, documentTag: docTag });
    } catch (error) {
      next(error);
    }
  }

  async removeTagFromDocument(req, res, next) {
    try {
      await tagService.removeTagFromDocument(req.user.id, req.params.workspaceId, req.params.documentId, req.params.tagId);
      res.json({ success: true, message: 'Tag removed from document' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TagController();
