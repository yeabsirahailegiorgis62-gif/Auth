const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const { cacheMiddleware } = require("../middleware/cache.middleware");
const prisma = require("../config/database");

router.get("/profile", authenticate, cacheMiddleware(300), (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user,
  });
});

router.patch("/profile", authenticate, async (req, res, next) => {
  try {
    const { name, avatarUrl, bio } = req.body;
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    const { clearCachePrefix } = require("../middleware/cache.middleware");
    clearCachePrefix(`__express__${req.user.id}`);

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/audit-logs", authenticate, async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        document: { select: { id: true, title: true } },
      },
    });

    res.json({
      success: true,
      auditLogs: logs.map((l) => ({
        ...l,
        metadata: l.metadata ? JSON.parse(l.metadata) : null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/search", authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const query = q.trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.user.id } },
          {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10,
    });

    return res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
