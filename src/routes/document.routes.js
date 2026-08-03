const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const documentController = require("../controllers/document.controller");
const shareController = require("../controllers/share.controller");

// Protect all document endpoints with JWT authentication
router.use(authenticate);

// Document Trash & Organization endpoints
router.get("/trash", (req, res, next) => documentController.getTrashDocuments(req, res, next));
router.post("/:id/trash", (req, res, next) => documentController.trashDocument(req, res, next));
router.post("/:id/restore", (req, res, next) => documentController.restoreDocument(req, res, next));
router.delete("/:id/permanent", (req, res, next) => documentController.deleteDocument(req, res, next));

// Document CRUD endpoints
router.get("/", (req, res, next) => documentController.getDocuments(req, res, next));
router.post("/", (req, res, next) => documentController.createDocument(req, res, next));
router.get("/:id", (req, res, next) => documentController.getDocumentById(req, res, next));
router.patch("/:id", (req, res, next) => documentController.updateDocument(req, res, next));
router.delete("/:id", (req, res, next) => documentController.trashDocument(req, res, next));
router.post("/:id/duplicate", (req, res, next) => documentController.duplicateDocument(req, res, next));

// Document Sharing & Collaborator Management endpoints
router.post("/:id/share", (req, res, next) => shareController.shareDocument(req, res, next));
router.get("/:id/collaborators", (req, res, next) => shareController.getCollaborators(req, res, next));
router.patch("/:id/collaborators/:userId", (req, res, next) => shareController.updateCollaboratorRole(req, res, next));
router.delete("/:id/collaborators/:userId", (req, res, next) => shareController.removeCollaborator(req, res, next));

module.exports = router;
