const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 }); // default TTL 60 seconds

const cacheMiddleware = (ttl) => (req, res, next) => {
  // Only cache GET requests
  if (req.method !== "GET") {
    return next();
  }

  // Construct a cache key. If authenticated, include user ID to prevent cross-user caching.
  const userId = req.user?.id || "anonymous";
  const key = `__express__${userId}__${req.originalUrl || req.url}`;

  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  // Override res.json to cache the response before sending
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    cache.set(key, body, ttl);
    originalJson(body);
  };

  next();
};

const clearCachePrefix = (prefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(k => k.includes(prefix));
  cache.del(keysToDelete);
};

module.exports = {
  cacheMiddleware,
  clearCachePrefix,
  cache
};
