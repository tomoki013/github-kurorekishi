import { useState, useEffect, useCallback } from "react";
import type { MeResponse } from "../types/api";

export function useAuth(): {
  user: MeResponse | null;
  loading: boolean;
  logout: () => Promise<void>;
} {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        if (!cancelled) {
          if (res.ok) {
            const data = (await res.json()) as MeResponse;
            setUser(data);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
  }, []);

  return { user, loading, logout };
}
