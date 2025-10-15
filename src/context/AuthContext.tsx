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

  // Query all users for role switching
  const allUsers = useQuery(api.user.getAllUsers) ?? [];

  // Query current user from Convex
  const currentUser = useQuery(
    api.user.getUserById,
    currentUserId ? { userId: currentUserId } : "skip"
  ) as User | null | undefined;

  const simpleLogin = useMutation(api.user.simpleLogin);

  // Initialize with default admin user if no user is selected
  useEffect(() => {
    if (!currentUserId && allUsers.length > 0) {
      // Find first admin user
      const adminUser = allUsers.find((u) => u.role === "admin");
      if (adminUser) {
        setCurrentUserId(adminUser._id);
        localStorage.setItem("currentUserId", adminUser._id);
      }
    }
  }, [currentUserId, allUsers]);

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

  // Dev mode: Switch roles dynamically by finding users with that role
  const setDevRole = (role: "super_admin" | "admin" | "trainee") => {
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      setCurrentUserId(user._id);
      localStorage.setItem("currentUserId", user._id);
      console.log(`Switched to ${role}:`, user.name);
    } else {
      console.error(`No user found with role: ${role}`);
      console.log(
        "Available users:",
        allUsers.map((u) => ({ name: u.name, role: u.role }))
      );
    }
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
