import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "./WalletContext";
import type { ForumProfile, InsertForumProfile } from "@shared/schema";

interface ForumProfileContextType {
  profile: ForumProfile | null;
  isLoading: boolean;
  hasProfile: boolean;
  registerProfile: (data: Omit<InsertForumProfile, "walletAddress">) => Promise<ForumProfile | null>;
  displayName: string;
  refetch: () => void;
}

const ForumProfileContext = createContext<ForumProfileContextType>({
  profile: null,
  isLoading: false,
  hasProfile: false,
  registerProfile: async () => null,
  displayName: "",
  refetch: () => {},
});

export function ForumProfileProvider({ children }: { children: React.ReactNode }) {
  const { address, shortAddress, isConnected } = useWallet();
  const [profile, setProfile] = useState<ForumProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!address) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/forum/profile/${address.toLowerCase()}`);
      if (res.ok) {
        setProfile(await res.json());
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isConnected, fetchProfile]);

  const registerProfile = useCallback(async (data: Omit<InsertForumProfile, "walletAddress">): Promise<ForumProfile | null> => {
    if (!address) return null;
    try {
      const res = await fetch("/api/forum/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, walletAddress: address.toLowerCase() }),
      });
      if (res.ok) {
        const p = await res.json();
        setProfile(p);
        return p;
      }
    } catch {}
    return null;
  }, [address]);

  const displayName = profile
    ? profile.displayMode === "username" && profile.username
      ? profile.username
      : (shortAddress ?? "")
    : (shortAddress ?? "");

  return (
    <ForumProfileContext.Provider value={{ profile, isLoading, hasProfile: !!profile, registerProfile, displayName, refetch: fetchProfile }}>
      {children}
    </ForumProfileContext.Provider>
  );
}

export function useForumProfile() {
  return useContext(ForumProfileContext);
}
