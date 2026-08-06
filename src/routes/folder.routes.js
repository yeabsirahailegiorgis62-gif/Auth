const express = require('express');
const router = express.Router({ mergeParams: true });

const folderController = require('../controllers/folder.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

// Note: Requires workspaceId in params (from parent router)
router.post('/', folderController.createFolder);
router.get('/', folderController.getRootFolders);
router.get('/:folderId', folderController.getFolder);
router.patch('/:folderId', folderController.renameFolder);
router.patch('/:folderId/move', folderController.moveFolder);
router.delete('/:folderId', folderController.deleteFolder);

module.exports = router;
