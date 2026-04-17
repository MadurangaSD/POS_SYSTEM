const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

function errorHandler(err, req, res, next) {
  // Log error details for debugging (excluding sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err.message);
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {})
      .map((item) => item.message)
      .filter(Boolean);

    return res.status(400).json({
      error: details[0] || err.message || 'Validation failed',
      details,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid value for ${err.path}`,
      details: [err.message],
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      error: field ? `${field} already exists` : 'Duplicate value already exists',
      details: [err.message],
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  errorHandler,
};
