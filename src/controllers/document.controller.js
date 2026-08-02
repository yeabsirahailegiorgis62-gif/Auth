const { documentService } = require("../services/document.service");
const {
  createDocumentSchema,
  updateDocumentSchema,
  queryDocumentSchema,
} = require("../validators/document.validator");

class DocumentController {
  async getDocuments(req, res, next) {
    try {
      const query = queryDocumentSchema.parse(req.query);
      const documents = await documentService.getUserDocuments(
        req.user.id,
        query,
      );

      res.status(200).json({
        success: true,
        count: documents.length,
        documents,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req, res, next) {
    try {
      const body = createDocumentSchema.parse(req.body);
      const document = await documentService.createDocument(req.user.id, body);

      res.status(201).json({
        success: true,
        message: "Document created successfully",
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(req.user.id, id);

      res.status(200).json({
        success: true,
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const body = updateDocumentSchema.parse(req.body);
      const document = await documentService.updateDocument(
        req.user.id,
        id,
        body,
      );

      res.status(200).json({
        success: true,
        message: "Document updated successfully",
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  async trashDocument(req, res, next) {
    try {
      const { id } = req.params;
      const result = await documentService.trashDocument(req.user.id, id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreDocument(req, res, next) {
    try {
      const { id } = req.params;
      const result = await documentService.restoreDocument(req.user.id, id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrashDocuments(req, res, next) {
    try {
      const documents = await documentService.getTrashDocuments(req.user.id);
      res.status(200).json({
        success: true,
        count: documents.length,
        documents,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const result = await documentService.deleteDocument(req.user.id, id);

      res.status(200).json({
        success: true,
        message: result.message,
        id: result.id,
      });
    } catch (error) {
      next(error);
    }
  }

  async duplicateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.duplicateDocument(
        req.user.id,
        id,
      );

      res.status(201).json({
        success: true,
        message: "Document duplicated successfully",
        document,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
