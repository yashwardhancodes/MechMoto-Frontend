// utils/auth.ts
export type AuthData = {
  token: string;
  user: {
    id: string;
    [key: string]: any; // extendable for other user props
  };
};

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
