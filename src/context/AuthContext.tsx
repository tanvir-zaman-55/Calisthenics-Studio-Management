import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type Role = "super_admin" | "admin" | "trainee";

interface User {
  _id: Id<"users">;
  _creationTime: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profileImage?: string;
  assignedAdminId?: Id<"users">;
  weeklyGoal?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalWorkouts?: number;
  joinDate?: number;
  emergencyContact?: string;
  medicalNotes?: string;
  createdAt: number;
  updatedAt: number;
}

interface AuthContextType {
  currentUser: User | null;
  currentUserRole: Role;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTrainee: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setCurrentUserById: (userId: Id<"users">) => void;
  setDevRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Check if authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // Get current user ID from localStorage
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(() => {
    const stored = localStorage.getItem("currentUserId");
    return stored as Id<"users"> | null;
  });

  // Load all users from Convex
  const allUsers = useQuery(api.user.getAllUsers) ?? [];

  // Find current user
  const currentUser = allUsers.find((u) => u._id === currentUserId) || null;

  const currentUserRole: Role = currentUser?.role || "trainee";

  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdmin = currentUserRole === "admin" || isSuperAdmin;
  const isTrainee = currentUserRole === "trainee";

  // Logout function
  const logout = () => {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setCurrentUserId(null);
    window.location.href = "/login";
  };

  // Dev mode: Switch users
  const setCurrentUserById = (userId: Id<"users">) => {
    const user = allUsers.find((u) => u._id === userId);
    if (user) {
      localStorage.setItem("currentUserId", userId);
      console.log(`Switching to user:`, user.name);
      window.location.href = window.location.pathname;
    }
  };

  const setDevRole = (role: Role) => {
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      localStorage.setItem("currentUserId", user._id);
      console.log(`Switched to ${role}:`, user.name);
      window.location.href = window.location.pathname;
    } else {
      console.error(`No user found with role: ${role}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserRole,
        isSuperAdmin,
        isAdmin,
        isTrainee,
        isAuthenticated,
        logout,
        setCurrentUserById,
        setDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
