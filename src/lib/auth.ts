/**
 * KisanProcure – Auth helpers
 * Handles token storage, JWT decode, and role-based redirects.
 */

export type AuthRole = "FARMER" | "OFFICER" | "ADMIN";

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  role: AuthRole;
  userId: string;
  mobileNumber: string;
  firstName?: string;
  lastName?: string;
}

const KEY = "kp_auth";

// ─── Storage ─────────────────────────────────────────────────────────────────

export function saveAuth(tokens: { accessToken: string; refreshToken: string }): StoredAuth | null {
  try {
    const payload = decodeJwt(tokens.accessToken);
    if (!payload) return null;
    const auth: StoredAuth = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: payload.role as AuthRole,
      userId: payload.sub,
      mobileNumber: payload.mobileNumber || "",
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
    localStorage.setItem(KEY, JSON.stringify(auth));
    // also keep legacy key for existing api.ts helpers
    localStorage.setItem("kp_token", tokens.accessToken);
    return auth;
  } catch {
    return null;
  }
}

export function getAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw) as StoredAuth;
    if (isTokenExpired(auth.accessToken)) {
      clearAuth();
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("kp_token");
}

// ─── JWT Decode (no library) ──────────────────────────────────────────────────

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return Date.now() / 1000 > payload.exp;
}

// ─── Role → Route ─────────────────────────────────────────────────────────────

export function roleHome(role: AuthRole): string {
  switch (role) {
    case "ADMIN":   return "/admin";
    case "OFFICER": return "/officer";
    case "FARMER":  return "/farmer";
    default:        return "/farmer";
  }
}
