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
  setDevRole: (role: Role) => void;
  setCurrentUserById: (userId: Id<"users">) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load all users from Convex
  const allUsers = useQuery(api.user.getAllUsers) ?? [];

  // Get current user ID from localStorage (for dev mode)
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(() => {
    const stored = localStorage.getItem("currentUserId");
    return stored as Id<"users"> | null;
  });

  // Find current user
  const currentUser = allUsers.find((u) => u._id === currentUserId) || null;

  // If no user selected or user doesn't exist, default to first super admin
  useEffect(() => {
    if (!currentUser && allUsers.length > 0) {
      const superAdmin = allUsers.find((u) => u.role === "super_admin");
      if (superAdmin) {
        setCurrentUserId(superAdmin._id);
        localStorage.setItem("currentUserId", superAdmin._id);
      }
    }
  }, [allUsers, currentUser]);

  const currentUserRole: Role = currentUser?.role || "trainee";

  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdmin = currentUserRole === "admin" || isSuperAdmin;
  const isTrainee = currentUserRole === "trainee";

  const setDevRole = (role: Role) => {
    // Find a user with this role
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      localStorage.setItem("currentUserId", user._id);
      console.log(`Switching to ${role}:`, user.name);
      // Force complete page reload
      window.location.href = window.location.pathname;
    } else {
      console.error(`No user found with role: ${role}`);
    }
  };

  const setCurrentUserById = (userId: Id<"users">) => {
    const user = allUsers.find((u) => u._id === userId);
    if (user) {
      localStorage.setItem("currentUserId", userId);
      console.log(`Switching to user:`, user.name);
      // Force complete page reload to clear ALL cached data
      window.location.href = window.location.pathname;
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
        setDevRole,
        setCurrentUserById,
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
