const documentRepository = require("../repositories/document.repository");

const ROLES = {
  OWNER: "OWNER",
  EDITOR: "EDITOR",
  COMMENTER: "COMMENTER",
  VIEWER: "VIEWER",
};

const PERMISSIONS = {
  READ: "READ",
  EDIT: "EDIT",
  COMMENT: "COMMENT",
  SHARE: "SHARE",
  DELETE: "DELETE",
};

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    PERMISSIONS.READ,
    PERMISSIONS.EDIT,
    PERMISSIONS.COMMENT,
    PERMISSIONS.SHARE,
    PERMISSIONS.DELETE,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.EDIT,
    PERMISSIONS.COMMENT,
  ],
  [ROLES.COMMENTER]: [
    PERMISSIONS.READ,
    PERMISSIONS.COMMENT,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.READ,
  ],
};

class PermissionService {
  get ROLES() {
    return ROLES;
  }

  get PERMISSIONS() {
    return PERMISSIONS;
  }

  async getUserRole(documentId, userId) {
    const document = await documentRepository.findById(documentId);
    if (!document) {
      return null;
    }

    if (String(document.ownerId) === String(userId)) {
      return ROLES.OWNER;
    }

    const share = document.shares?.find((s) => String(s.userId) === String(userId));
    if (share) {
      return share.role.toUpperCase();
    }

    return null;
  }

  async hasPermission(documentId, userId, permission) {
    const role = await this.getUserRole(documentId, userId);
    if (!role) {
      return false;
    }

    const allowedPermissions = ROLE_PERMISSIONS[role] || [];
    return allowedPermissions.includes(permission);
  }

  async assertPermission(documentId, userId, permission) {
    const document = await documentRepository.findById(documentId);
    if (!document) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      throw error;
    }

    const role = await this.getUserRole(documentId, userId);
    if (!role) {
      const error = new Error("Access denied: You do not have access to this document");
      error.statusCode = 403;
      throw error;
    }

    const allowedPermissions = ROLE_PERMISSIONS[role] || [];
    if (!allowedPermissions.includes(permission)) {
      const error = new Error(
        `Permission denied: Requires '${permission}' permission for document`,
      );
      error.statusCode = 403;
      throw error;
    }

    return { document, role };
  }
}

module.exports = new PermissionService();
