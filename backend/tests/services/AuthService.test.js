const AuthService = require("../../src/services/AuthService");
const { initializeDatabase, seedDatabase } = require("../../src/models/database");

beforeAll(() => {
  initializeDatabase();
  seedDatabase();
});

describe("AuthService", () => {
  describe("login", () => {
    test("should login with correct credentials", () => {
      const result = AuthService.login("admin", "admin");
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.username).toBe("admin");
      expect(result.user.role).toBe("admin");
    });

    test("should login with cashier credentials", () => {
      const result = AuthService.login("cashier", "cashier");
      expect(result.user.role).toBe("cashier");
    });

    test("should throw error for invalid username", () => {
      expect(() => {
        AuthService.login("invalid", "password");
      }).toThrow();
    });

    test("should throw error for invalid password", () => {
      expect(() => {
        AuthService.login("admin", "wrongpassword");
      }).toThrow();
    });
  });

  describe("getCurrentUser", () => {
    test("should get current user from token", () => {
      const loginResult = AuthService.login("admin", "admin");
      const user = AuthService.getCurrentUser(loginResult.token);

      expect(user).toBeDefined();
      expect(user.username).toBe("admin");
      expect(user.role).toBe("admin");
    });

    test("should throw error for invalid token", () => {
      expect(() => {
        AuthService.getCurrentUser("invalid-token");
      }).toThrow();
    });
  });
});
