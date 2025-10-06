import useSWR from "swr";
import { getToken,getUserId } from "@/lib/utils/auth";
// types/subscription.ts
export type Module = {
  id: number;
  name: string;
  limit?: number;
};

export type Subscription = {
  id: number;
  planName: string;
  modules: Module[];
  expiresAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

// ✅ Centralized fetcher with Bearer token
const fetcher = async (url: string) => {
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// ✅ Hook to get active subscription
export function useSubscription() {
  const userId = getUserId();

  const { data, error, mutate, isLoading } = useSWR<Subscription>(
    userId ? `${API_BASE}/subscriptions/active/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  return {
    subscription: data,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

// ✅ Hook to check if a module exists in subscription
export function useHasModule(moduleName: string) {
  const { subscription } = useSubscription();
  return subscription?.modules?.some((m) => m.name === moduleName) ?? false;
}

// ✅ Utility to consume module usage
export async function consumeModuleUsage(moduleId: number) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/modules/consume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ moduleId }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
