const express = require('express');
const router = express.Router({ mergeParams: true });
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth.middleware');
const permissionService = require('../services/permission.service');
const prisma = require('../../config/prisma');

// Simple middleware to check workspace role inline
const checkWorkspaceRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user.id;

      const workspace = await prisma.workspace.findUnique({
         where: { id: workspaceId },
         include: { members: true }
      });

      if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

      let role = null;
      if (workspace.ownerId === userId) {
         role = 'OWNER';
      } else {
         const member = workspace.members.find(m => m.userId === userId);
         if (member) role = member.role;
      }

      if (!role || !roles.includes(role)) {
         return res.status(403).json({ error: 'Insufficient workspace permissions' });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
};

router.use(authenticate);

// Routes mounted at /api/workspaces/:workspaceId/ai
// Only Workspace Owners can update AI Config
router.get('/config', checkWorkspaceRole(['OWNER', 'ADMIN']), aiController.getConfig);
router.post('/config', checkWorkspaceRole(['OWNER']), aiController.updateConfig);

// AI Actions on a document
router.post('/:documentId/action', async (req, res, next) => {
  try {
     // Check document permission first (Viewer or higher)
     await permissionService.assertPermission(req.params.documentId, req.user.id, permissionService.PERMISSIONS.READ);
     next();
  } catch (error) {
     next(error);
  }
}, aiController.processAction);

module.exports = router;
