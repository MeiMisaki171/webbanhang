import type { AuthUser, LoginInput, RegisterInput } from "@repo/shared";
import {
  fetchMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/services/auth.service";

export async function login(input: LoginInput): Promise<AuthUser> {
  return loginRequest(input);
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  return registerRequest(input);
}

export async function logout(): Promise<void> {
  return logoutRequest();
}

export async function fetchMe(): Promise<AuthUser> {
  return fetchMeRequest();
}
