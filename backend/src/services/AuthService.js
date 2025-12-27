const { User } = require("../models/database");
const { generateToken, verifyToken } = require("../utils/jwt");

class AuthService {
  static async login(username, password) {
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      token,
    };
  }

  static async getCurrentUser(token) {
    const decoded = verifyToken(token);
    if (!decoded) {
      throw { status: 401, message: "Invalid token" };
    }

    const user = await User.findById(decoded.id).select("_id username role");

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    return {
      id: user._id,
      username: user.username,
      role: user.role,
    };
  }
}

module.exports = AuthService;
