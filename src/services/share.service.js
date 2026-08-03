const prisma = require("../config/database");
const permissionService = require("./permission.service");
const activityService = require("./activity.service");
const notificationService = require("./notification.service");
const documentRepository = require("../repositories/document.repository");

class ShareService {
  async shareDocument({ documentId, requestingUserId, targetEmail, role = "VIEWER" }) {
    await permissionService.assertPermission(
      documentId,
      requestingUserId,
      permissionService.PERMISSIONS.SHARE,
    );

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail.trim().toLowerCase() },
    });

    if (!targetUser) {
      const error = new Error("User not found with the specified email");
      error.statusCode = 404;
      throw error;
    }

    const document = await documentRepository.findById(documentId);
    if (document.ownerId === targetUser.id) {
      const error = new Error("Cannot share document with the document owner");
      error.statusCode = 400;
      throw error;
    }

    const normalizedRole = role.toUpperCase();
    if (!["VIEWER", "COMMENTER", "EDITOR"].includes(normalizedRole)) {
      const error = new Error("Invalid role. Role must be VIEWER, COMMENTER, or EDITOR");
      error.statusCode = 400;
      throw error;
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: targetUser.id,
        },
      },
      update: {
        role: normalizedRole,
        invitedById: requestingUserId,
      },
      create: {
        documentId,
        userId: targetUser.id,
        role: normalizedRole,
        invitedById: requestingUserId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await activityService.logActivity(requestingUserId, documentId, "DOCUMENT_SHARED", {
      targetEmail: targetUser.email,
      role: normalizedRole,
    });

    await notificationService.createNotification(
      targetUser.id,
      documentId,
      "DOCUMENT_SHARED",
      `A document "${document.title}" was shared with you as ${normalizedRole}.`
    );

    // Notify connected sockets in document room of real-time permission update
    try {
      const { getIO } = require("../socket/socket.server");
      const io = getIO();
      io.in(`document:${documentId}`).emit("permission:changed", {
        documentId,
        userId: targetUser.id,
        role: normalizedRole,
        user: share.user,
      });
    } catch {
      // Socket server may not be active in mock unit testing environment
    }

    return share;
  }

  async getCollaborators(documentId, requestingUserId) {
    await permissionService.assertPermission(
      documentId,
      requestingUserId,
      permissionService.PERMISSIONS.READ,
    );

    const document = await documentRepository.findById(documentId);

    const shares = await prisma.documentShare.findMany({
      where: { documentId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const ownerEntry = {
      id: "owner",
      documentId,
      userId: document.owner.id,
      role: "OWNER",
      user: {
        id: document.owner.id,
        name: document.owner.name,
        email: document.owner.email,
      },
      createdAt: document.createdAt,
    };

    return [ownerEntry, ...shares];
  }

  async updateCollaboratorRole({ documentId, requestingUserId, targetUserId, newRole }) {
    await permissionService.assertPermission(
      documentId,
      requestingUserId,
      permissionService.PERMISSIONS.SHARE,
    );

    const document = await documentRepository.findById(documentId);
    if (document.ownerId === targetUserId) {
      const error = new Error("Cannot change role of the document owner");
      error.statusCode = 400;
      throw error;
    }

    const normalizedRole = newRole.toUpperCase();
    if (!["VIEWER", "COMMENTER", "EDITOR"].includes(normalizedRole)) {
      const error = new Error("Invalid role. Role must be VIEWER, COMMENTER, or EDITOR");
      error.statusCode = 400;
      throw error;
    }

    const updatedShare = await prisma.documentShare.update({
      where: {
        documentId_userId: {
          documentId,
          userId: targetUserId,
        },
      },
      data: { role: normalizedRole },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    try {
      const { getIO } = require("../socket/socket.server");
      const io = getIO();
      io.in(`document:${documentId}`).emit("permission:changed", {
        documentId,
        userId: targetUserId,
        role: normalizedRole,
        user: updatedShare.user,
      });
    } catch {
      // Socket server fallback
    }

    return updatedShare;
  }

  async removeCollaborator({ documentId, requestingUserId, targetUserId }) {
    await permissionService.assertPermission(
      documentId,
      requestingUserId,
      permissionService.PERMISSIONS.SHARE,
    );

    const document = await documentRepository.findById(documentId);
    if (document.ownerId === targetUserId) {
      const error = new Error("Cannot remove the document owner");
      error.statusCode = 400;
      throw error;
    }

    await prisma.documentShare.delete({
      where: {
        documentId_userId: {
          documentId,
          userId: targetUserId,
        },
      },
    });

    try {
      const { getIO } = require("../socket/socket.server");
      const io = getIO();
      io.in(`document:${documentId}`).emit("access:revoked", {
        documentId,
        userId: targetUserId,
      });
    } catch {
      // Socket server fallback
    }

    return { success: true, message: "Collaborator removed successfully" };
  }
}

module.exports = new ShareService();
