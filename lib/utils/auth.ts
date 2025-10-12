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
    const storageKey = "auth";

	// ✅ Check localStorage first (persistent)
	let raw = localStorage.getItem(storageKey);
	if (!raw) {
		// Fallback to sessionStorage (current session)
		raw = sessionStorage.getItem(storageKey);
	}
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