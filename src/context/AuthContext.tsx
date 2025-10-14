"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type UserRole = "super_admin" | "admin" | "trainee";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTrainee: boolean;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for each role
const mockUsers: Record<UserRole, User> = {
  super_admin: {
    id: "1",
    name: "Super Admin",
    email: "superadmin@calisthenics.com",
    role: "super_admin",
  },
  admin: {
    id: "2",
    name: "Admin User",
    email: "admin@calisthenics.com",
    role: "admin",
  },
  trainee: {
    id: "3",
    name: "John Trainee",
    email: "trainee@calisthenics.com",
    role: "trainee",
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Load role from localStorage or default to super_admin for development
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("dev_user_role") as UserRole;
    return savedRole || "super_admin";
  });

  const [currentUser, setCurrentUser] = useState<User | null>(
    mockUsers[currentUserRole]
  );

  // Save role to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dev_user_role", currentUserRole);
    setCurrentUser(mockUsers[currentUserRole]);
  }, [currentUserRole]);

  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdmin = currentUserRole === "admin" || isSuperAdmin;
  const isTrainee = currentUserRole === "trainee";

  // Helper function to check if user has access based on allowed roles
  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(currentUserRole);
  };

  // Mock login function for development
  const login = (role: UserRole) => {
    setCurrentUserRole(role);
  };

  // Mock logout function
  const logout = () => {
    setCurrentUserRole("trainee"); // Default to lowest privilege
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserRole,
        setCurrentUserRole,
        isSuperAdmin,
        isAdmin,
        isTrainee,
        hasAccess,
        login,
        logout,
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
