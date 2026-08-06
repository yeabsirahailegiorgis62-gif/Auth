const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const emailService = require('./email.service');

const ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  COMMENTER: 1,
  VIEWER: 0
};

class WorkspaceService {
  hasPermission(userRole, requiredRole) {
    if (!ROLE_HIERARCHY.hasOwnProperty(userRole) || !ROLE_HIERARCHY.hasOwnProperty(requiredRole)) {
      return false;
    }
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }

  async createWorkspace(userId, { name, description, color, logoUrl }) {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        color,
        logoUrl,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        workspaceId: workspace.id,
        action: 'WORKSPACE_CREATED',
        metadata: JSON.stringify({ name })
      }
    });

    return workspace;
  }

  async getWorkspace(userId, workspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      }
    });

    if (!member) {
      throw new Error('Access denied');
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      }
    });

    return { workspace, memberRole: member.role };
  }

  async getUserWorkspaces(userId) {
    return await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          where: { userId },
          select: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateWorkspace(userId, workspaceId, data) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!member || !this.hasPermission(member.role, 'ADMIN')) {
      throw new Error('Access denied. Admins only.');
    }

    return await prisma.workspace.update({
      where: { id: workspaceId },
      data
    });
  }

  async deleteWorkspace(userId, workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) throw new Error('Workspace not found');
    if (workspace.ownerId !== userId) {
      throw new Error('Only the workspace owner can delete it');
    }

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    return { success: true };
  }

  async inviteUser(userId, workspaceId, email, role) {
    const inviter = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });

    if (!inviter || !this.hasPermission(inviter.role, 'ADMIN')) {
      throw new Error('Access denied. Admins only.');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: existingUser.id } }
      });
      if (existingMember) throw new Error('User is already a member');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId,
        email,
        role,
        tokenHash,
        invitedById: userId,
        expiresAt
      }
    });

    // emailService.sendWorkspaceInvite(email, workspace.name, token);

    return { success: true, message: 'Invitation sent', inviteId: invitation.id, token };
  }

  async acceptInvitation(userId, token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash }
    });

    if (!invitation) throw new Error('Invalid invitation');
    if (invitation.status !== 'PENDING') throw new Error(`Invitation is ${invitation.status}`);
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' }});
      throw new Error('Invitation has expired');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.email !== invitation.email) {
      throw new Error('Invitation email does not match your account email');
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role
      }
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
        action: 'WORKSPACE_JOINED'
      }
    });

    return { success: true, workspaceId: invitation.workspaceId };
  }

  async updateMemberRole(adminId, workspaceId, memberUserId, newRole) {
    const admin = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: adminId } }
    });

    if (!admin || !this.hasPermission(admin.role, 'ADMIN')) {
      throw new Error('Access denied. Admins only.');
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } }
    });

    if (!member) throw new Error('Member not found');
    
    if (member.role === 'OWNER') {
       throw new Error('Cannot change the owner\'s role');
    }
    
    if (newRole === 'ADMIN' && admin.role !== 'OWNER') {
        throw new Error('Only owners can promote to Admin');
    }

    return await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } },
      data: { role: newRole }
    });
  }

  async removeMember(adminId, workspaceId, memberUserId) {
    const admin = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: adminId } }
    });

    if (!admin || !this.hasPermission(admin.role, 'ADMIN')) {
      throw new Error('Access denied. Admins only.');
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } }
    });

    if (!member) throw new Error('Member not found');
    if (member.role === 'OWNER') throw new Error('Cannot remove the workspace owner');
    
    if (member.role === 'ADMIN' && admin.role !== 'OWNER') {
        throw new Error('Only owners can remove Admins');
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } }
    });

    return { success: true };
  }
}

module.exports = new WorkspaceService();
