import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@repo/shared";
import { compare, hash } from "bcryptjs";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const baseUser = {
  id: "user-1",
  email: "a@example.com",
  phone: null,
  passwordHash: "hash",
  fullName: null,
  role: UserRole.CUSTOMER,
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z"),
};

describe("AuthService", () => {
  let repository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let service: AuthService;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(repository, jwtService);
    jest.clearAllMocks();
  });

  it("rejects register when email already exists", async () => {
    repository.findByEmail.mockResolvedValue(baseUser);

    await expect(
      service.register({ email: "a@example.com", password: "password123" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects register when phone already exists", async () => {
    repository.findByPhone.mockResolvedValue({
      ...baseUser,
      email: null,
      phone: "0901234567",
    });

    await expect(
      service.register({ phone: "0901234567", password: "password123" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects login with invalid password", async () => {
    repository.findByEmail.mockResolvedValue(baseUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ identifier: "a@example.com", password: "wrong" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("logs in with phone identifier", async () => {
    repository.findByPhone.mockResolvedValue({
      ...baseUser,
      email: null,
      phone: "0901234567",
    });
    (compare as jest.Mock).mockResolvedValue(true);

    const user = await service.login({ identifier: "0901234567", password: "password123" });

    expect(user.phone).toBe("0901234567");
    expect(repository.findByPhone).toHaveBeenCalledWith("0901234567");
  });

  it("issues access and refresh tokens", () => {
    jwtService.sign.mockReturnValueOnce("access-token").mockReturnValueOnce("refresh-token");

    const tokens = service.issueTokens({
      id: "user-1",
      email: "a@example.com",
      phone: null,
      fullName: null,
      role: UserRole.CUSTOMER,
      createdAt: "2026-05-14T00:00:00.000Z",
    });

    expect(tokens).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" });
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
  });
});
