const prisma = require("../config/database");
const crypto = require("crypto");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Session Service
 * Handles device session creation, listing, individual revocation, and global logout.
 */
class SessionService {
  /**
   * Create a new session for a user
   */
  async createSession(userId, refreshToken, metadata = {}) {
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        device: metadata.device || "Unknown Device",
        ipAddress: metadata.ipAddress || "Unknown IP",
        expiresAt,
      },
    });

    return session;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId, currentRefreshTokenHash = null) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((session) => ({
      id: session.id,
      device: session.device,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: currentRefreshTokenHash
        ? session.refreshTokenHash === currentRefreshTokenHash
        : false,
    }));
  }

  /**
   * Find a specific session by refresh token hash
   */
  async findSessionByTokenHash(refreshTokenHash) {
    return prisma.session.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });
  }

  /**
   * Revoke an individual session by session ID for a user
   */
  async revokeSessionById(userId, sessionId) {
    const session = await prisma.session.findFirst({
      where: { id: parseInt(sessionId, 10), userId },
    });

    if (!session) {
      return false;
    }

    await prisma.session.delete({
      where: { id: session.id },
    });

    return true;
  }

  /**
   * Revoke session by refresh token hash
   */
  async revokeSessionByTokenHash(refreshTokenHash) {
    try {
      await prisma.session.delete({
        where: { refreshTokenHash },
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Revoke all active sessions for a user (Optionally preserving current session)
   */
  async revokeAllUserSessions(userId, exceptRefreshTokenHash = null) {
    const whereClause = { userId };
    if (exceptRefreshTokenHash) {
      whereClause.refreshTokenHash = { not: exceptRefreshTokenHash };
    }

    const result = await prisma.session.deleteMany({
      where: whereClause,
    });

    return result.count;
  }
}

module.exports = new SessionService();
