"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Home,
  Users,
  Calendar,
  ClipboardList,
  Shield,
  UserCog,
  Dumbbell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: ("super_admin" | "admin" | "trainee")[];
}

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    icon: Home,
    label: "Dashboard",
    roles: ["super_admin", "admin", "trainee"],
  },
  {
    to: "/clients",
    icon: Users,
    label: "Clients",
    roles: ["super_admin", "admin"],
  },
  {
    to: "/workouts",
    icon: Dumbbell,
    label: "Workouts",
    roles: ["super_admin", "admin", "trainee"],
  },
  {
    to: "/classes",
    icon: ClipboardList,
    label: "Classes",
    roles: ["super_admin", "admin", "trainee"],
  },
  {
    to: "/schedule",
    icon: Calendar,
    label: "Schedule",
    roles: ["super_admin", "admin", "trainee"],
  },
  {
    to: "/attendance",
    icon: ClipboardList, // We can use same icon or import CheckCircle2
    label: "Attendance",
    roles: ["super_admin", "admin", "trainee"],
  },
  { to: "/admins", icon: Shield, label: "Admins", roles: ["super_admin"] },
  {
    to: "/settings",
    icon: Settings,
    label: "Settings",
    roles: ["super_admin", "admin"],
  },
];

const roleConfig = {
  super_admin: {
    label: "Super Admin",
    badgeVariant: "default" as const,
    icon: Shield,
  },
  admin: {
    label: "Admin",
    badgeVariant: "secondary" as const,
    icon: UserCog,
  },
  trainee: {
    label: "Trainee",
    badgeVariant: "outline" as const,
    icon: Users,
  },
};

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const { currentUserRole, currentUser, setDevRole, setCurrentUserById } =
    useAuth();
  const RoleIcon = roleConfig[currentUserRole].icon;
  const allUsers = useQuery(api.user.getAllUsers);
  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-sidebar-primary mb-2">
          Calisthenics Studio
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RoleIcon className="h-4 w-4" />
          <span>{currentUser?.name}</span>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          // Only render if the current user role is allowed
          if (item.roles && !item.roles.includes(currentUserRole)) {
            return null;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-primary hover:text-sidebar-primary"
                )
              }
              onClick={onLinkClick}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Switcher - Development Only */}
      <div className="mt-auto pt-4 border-t">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current Role:</span>
            <Badge variant={roleConfig[currentUserRole].badgeVariant}>
              {roleConfig[currentUserRole].label}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Switch User (Dev Mode)
            </label>
            <Select
              value={currentUser?._id || ""}
              onValueChange={(userId) => {
                setCurrentUserById(userId as Id<"users">);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Super Admins */}
                {allUsers?.filter((u) => u.role === "super_admin").length >
                  0 && (
                  <>
                    <SelectItem
                      disabled
                      value="super-admin-header"
                      className="font-semibold"
                    >
                      Super Admins
                    </SelectItem>
                    {allUsers
                      ?.filter((u) => u.role === "super_admin")
                      .map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}

                {/* Admins */}
                {allUsers?.filter((u) => u.role === "admin").length > 0 && (
                  <>
                    <SelectItem
                      disabled
                      value="admin-header"
                      className="font-semibold mt-2"
                    >
                      Admins
                    </SelectItem>
                    {allUsers
                      ?.filter((u) => u.role === "admin")
                      .map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}

                {/* Trainees */}
                {allUsers?.filter((u) => u.role === "trainee").length > 0 && (
                  <>
                    <SelectItem
                      disabled
                      value="trainee-header"
                      className="font-semibold mt-2"
                    >
                      Trainees
                    </SelectItem>
                    {allUsers
                      ?.filter((u) => u.role === "trainee")
                      .map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onLinkClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex flex-col h-screen w-64 border-r bg-sidebar-background">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
