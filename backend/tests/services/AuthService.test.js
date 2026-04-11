const mockFindOne = jest.fn();
const mockFindById = jest.fn();

jest.mock("../../src/models/database", () => ({
  User: {
    findOne: mockFindOne,
    findById: mockFindById,
  },
}));

jest.mock("../../src/utils/jwt", () => ({
  generateToken: jest.fn(() => "test-token"),
  verifyToken: jest.fn((token) => (token === "test-token" ? { id: "u1" } : null)),
}));

const AuthService = require("../../src/services/AuthService");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("login succeeds with valid credentials", async () => {
    const user = {
      _id: "u1",
      username: "admin",
      role: "admin",
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await AuthService.login("admin", "password");

    expect(result.token).toBe("test-token");
    expect(result.user.username).toBe("admin");
  });

  test("login fails with invalid username", async () => {
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(AuthService.login("missing", "password")).rejects.toMatchObject({ status: 401 });
  });

  test("login fails with invalid password", async () => {
    const user = { comparePassword: jest.fn().mockResolvedValue(false) };
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(AuthService.login("admin", "wrong")).rejects.toMatchObject({ status: 401 });
  });

  test("getCurrentUser returns decoded user", async () => {
    const dbUser = { _id: "u1", username: "admin", role: "admin" };
    mockFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(dbUser) });

    const result = await AuthService.getCurrentUser("test-token");

    expect(result.username).toBe("admin");
  });

  test("getCurrentUser fails on invalid token", async () => {
    await expect(AuthService.getCurrentUser("invalid-token")).rejects.toMatchObject({ status: 401 });
  });
});
