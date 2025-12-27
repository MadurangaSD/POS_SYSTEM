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
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  errorHandler,
};
