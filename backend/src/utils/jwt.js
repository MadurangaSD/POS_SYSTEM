const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
