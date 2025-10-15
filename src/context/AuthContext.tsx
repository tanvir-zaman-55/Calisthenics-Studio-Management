import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "trainee";
  status: "active" | "inactive";
  phone?: string;
  assignedAdminId?: Id<"users">;
  weeklyGoal?: number;
}

interface AuthContextType {
  currentUser: User | null;
  currentUserRole: "super_admin" | "admin" | "trainee";
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTrainee: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  setDevRole: (role: "super_admin" | "admin" | "trainee") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(() => {
    const stored = localStorage.getItem("currentUserId");
    return stored as Id<"users"> | null;
  });

  // Query current user from Convex (note: api.user not api.users)
  const currentUser = useQuery(
    api.user.getUserById,
    currentUserId ? { userId: currentUserId } : "skip"
  ) as User | null | undefined;

  const simpleLogin = useMutation(api.user.simpleLogin);

  // Initialize with default user if none selected
  useEffect(() => {
    if (!currentUserId) {
      // Default to admin user for development
      const defaultUserId = "k179fgra9xtxk0mtqz1hxk45497shza4" as Id<"users">;
      setCurrentUserId(defaultUserId);
      localStorage.setItem("currentUserId", defaultUserId);
    }
  }, [currentUserId]);

  const login = async (email: string) => {
    try {
      const result = await simpleLogin({ email });
      setCurrentUserId(result.userId);
      localStorage.setItem("currentUserId", result.userId);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem("currentUserId");
  };

  // Dev mode: Switch roles using your actual seeded user IDs
  const setDevRole = (role: "super_admin" | "admin" | "trainee") => {
    // IMPORTANT: Replace these with YOUR actual user IDs from the seed result
    const roleToUserId: Record<string, string> = {
      super_admin: "k17eq2s2devscvxe2dahpdb4k17shvmw", // Your super admin ID
      admin: "k179fgra9xtxk0mtqz1hxk45497shza4", // Your admin ID
      trainee: "k177pvk0gj5qhyqewp13m40x6d7sh1k7", // Your trainee ID
    };

    const userId = roleToUserId[role] as Id<"users">;
    setCurrentUserId(userId);
    localStorage.setItem("currentUserId", userId);
  };

  const contextValue: AuthContextType = {
    currentUser: currentUser || null,
    currentUserRole: currentUser?.role || "admin",
    isSuperAdmin: currentUser?.role === "super_admin",
    isAdmin:
      currentUser?.role === "admin" || currentUser?.role === "super_admin",
    isTrainee: currentUser?.role === "trainee",
    login,
    logout,
    setDevRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
