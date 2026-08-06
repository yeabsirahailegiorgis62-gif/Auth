const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const { cacheMiddleware, clearCachePrefix } = require("../middleware/cache.middleware");
const documentController = require("../controllers/document.controller");
const shareController = require("../controllers/share.controller");

const clearDocCache = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      clearCachePrefix(`__express__${req.user.id}`);
    }
    originalJson(body);
  };
  next();
};

// Protect all document endpoints with JWT authentication
router.use(authenticate);

// Document Trash & Organization endpoints
router.get("/trash", (req, res, next) => documentController.getTrashDocuments(req, res, next));
router.post("/:id/trash", (req, res, next) => documentController.trashDocument(req, res, next));
router.post("/:id/restore", (req, res, next) => documentController.restoreDocument(req, res, next));
router.delete("/:id/permanent", (req, res, next) => documentController.deleteDocument(req, res, next));

// Document CRUD endpoints
router.get("/", cacheMiddleware(10), (req, res, next) => documentController.getDocuments(req, res, next));
router.post("/", clearDocCache, (req, res, next) => documentController.createDocument(req, res, next));
router.get("/:id", (req, res, next) => documentController.getDocumentById(req, res, next));
router.patch("/:id", clearDocCache, (req, res, next) => documentController.updateDocument(req, res, next));
router.delete("/:id", clearDocCache, (req, res, next) => documentController.trashDocument(req, res, next));
router.post("/:id/duplicate", clearDocCache, (req, res, next) => documentController.duplicateDocument(req, res, next));

// Document Sharing & Collaborator Management endpoints
router.post("/:id/share", (req, res, next) => shareController.shareDocument(req, res, next));
router.get("/:id/collaborators", (req, res, next) => shareController.getCollaborators(req, res, next));
router.patch("/:id/collaborators/:userId", (req, res, next) => shareController.updateCollaboratorRole(req, res, next));
router.delete("/:id/collaborators/:userId", (req, res, next) => shareController.removeCollaborator(req, res, next));

module.exports = router;
