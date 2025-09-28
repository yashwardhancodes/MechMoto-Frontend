export interface User {
  id: string;
  [key: string]: unknown;  
}

export interface AuthData {
  token: string;
  user: User;
}

export function getAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}

export function getUserId(): string | null {
  return getAuth()?.user?.id ?? null;
}