const AuthService = require("../services/AuthService");

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const user = await AuthService.getCurrentUser(token);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static logout(req, res) {
    // JWT is stateless, so logout just needs client-side token removal
    res.json({ message: "Logged out successfully" });
  }
}

module.exports = AuthController;
