const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const workspaceService = require('./workspace.service');

class FolderService {
  async createFolder(userId, workspaceId, name, parentId = null) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'EDITOR')) {
      throw new Error('Access denied. Editors only.');
    }

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({ where: { id: parentId } });
      if (!parentFolder || parentFolder.workspaceId !== workspaceId) {
        throw new Error('Invalid parent folder');
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        workspaceId,
        parentId
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        workspaceId,
        action: 'FOLDER_CREATED',
        metadata: JSON.stringify({ folderId: folder.id, name })
      }
    });

    return folder;
  }

  async getFolder(userId, workspaceId, folderId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member) {
      throw new Error('Access denied');
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        children: true,
        documents: {
          where: { isArchived: false }
        }
      }
    });

    if (!folder || folder.workspaceId !== workspaceId) {
      throw new Error('Folder not found in this workspace');
    }

    return folder;
  }

  async getRootFolders(userId, workspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member) {
      throw new Error('Access denied');
    }

    return await prisma.folder.findMany({
      where: {
        workspaceId,
        parentId: null
      },
      include: {
        _count: {
          select: { documents: true, children: true }
        }
      }
    });
  }

  async renameFolder(userId, workspaceId, folderId, newName) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'EDITOR')) {
      throw new Error('Access denied. Editors only.');
    }

    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.workspaceId !== workspaceId) throw new Error('Folder not found');

    return await prisma.folder.update({
      where: { id: folderId },
      data: { name: newName }
    });
  }

  async moveFolder(userId, workspaceId, folderId, newParentId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'EDITOR')) {
      throw new Error('Access denied. Editors only.');
    }

    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.workspaceId !== workspaceId) throw new Error('Folder not found');

    if (newParentId) {
        if (folderId === newParentId) throw new Error('Cannot move a folder into itself');
        const newParent = await prisma.folder.findUnique({ where: { id: newParentId } });
        if (!newParent || newParent.workspaceId !== workspaceId) throw new Error('Invalid destination folder');
    }

    return await prisma.folder.update({
      where: { id: folderId },
      data: { parentId: newParentId }
    });
  }

  async deleteFolder(userId, workspaceId, folderId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'ADMIN')) {
      throw new Error('Access denied. Admins only.');
    }

    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.workspaceId !== workspaceId) throw new Error('Folder not found');

    await prisma.folder.delete({
      where: { id: folderId }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        workspaceId,
        action: 'FOLDER_DELETED',
        metadata: JSON.stringify({ folderId, name: folder.name })
      }
    });

    return { success: true };
  }
}

module.exports = new FolderService();
