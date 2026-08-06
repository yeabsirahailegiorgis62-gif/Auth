const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const workspaceService = require('./workspace.service');

class TagService {
  async createTag(userId, workspaceId, name, color = '#e5e7eb') {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'EDITOR')) {
      throw new Error('Access denied. Editors only.');
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        workspaceId
      }
    });

    return tag;
  }

  async getWorkspaceTags(userId, workspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member) {
      throw new Error('Access denied');
    }

    return await prisma.tag.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' }
    });
  }

  async deleteTag(userId, workspaceId, tagId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'ADMIN')) {
      throw new Error('Access denied. Admins only.');
    }

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag || tag.workspaceId !== workspaceId) throw new Error('Tag not found');

    await prisma.tag.delete({
      where: { id: tagId }
    });

    return { success: true };
  }

  async addTagToDocument(userId, workspaceId, documentId, tagId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'EDITOR')) {
      throw new Error('Access denied. Editors only.');
    }

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.workspaceId !== workspaceId) throw new Error('Document not found in workspace');

    const tag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag || tag.workspaceId !== workspaceId) throw new Error('Tag not found in workspace');

    return await prisma.documentTag.create({
      data: {
        documentId,
        tagId
      }
    });
  }

  async removeTagFromDocument(userId, workspaceId, documentId, tagId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !workspaceService.hasPermission(member.role, 'EDITOR')) {
      throw new Error('Access denied. Editors only.');
    }

    const docTag = await prisma.documentTag.findUnique({
      where: { documentId_tagId: { documentId, tagId } }
    });

    if (!docTag) throw new Error('Tag is not attached to this document');

    await prisma.documentTag.delete({
      where: { documentId_tagId: { documentId, tagId } }
    });

    return { success: true };
  }
}

module.exports = new TagService();
