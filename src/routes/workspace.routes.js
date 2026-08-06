const express = require('express');
const router = express.Router();

const workspaceController = require('../controllers/workspace.controller');
const authenticate = require('../middleware/auth.middleware');
const aiRoutes = require('./ai.routes');

router.use(authenticate);

// Workspace CRUD
router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getUserWorkspaces);
router.get('/:workspaceId', workspaceController.getWorkspace);
router.patch('/:workspaceId', workspaceController.updateWorkspace);
router.delete('/:workspaceId', workspaceController.deleteWorkspace);

// Invitations & Membership
router.post('/:workspaceId/invite', workspaceController.inviteUser);
router.post('/accept-invitation', workspaceController.acceptInvitation);
router.patch('/:workspaceId/members/:userId', workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:userId', workspaceController.removeMember);

// AI
router.use('/:workspaceId/ai', aiRoutes);

module.exports = router;
