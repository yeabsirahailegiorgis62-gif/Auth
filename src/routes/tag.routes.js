const express = require('express');
const router = express.Router({ mergeParams: true });

const tagController = require('../controllers/tag.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

// Note: Requires workspaceId in params
router.post('/', tagController.createTag);
router.get('/', tagController.getWorkspaceTags);
router.delete('/:tagId', tagController.deleteTag);

// Tag assignment to documents
router.post('/:tagId/documents', tagController.addTagToDocument);
router.delete('/:tagId/documents/:documentId', tagController.removeTagFromDocument);

module.exports = router;
