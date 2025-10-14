import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

type UserRole = "super_admin" | "admin" | "trainee";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * RoleGuard component to restrict content based on user roles
 *
 * @example
 * // Only Super Admins can see this
 * <RoleGuard allowedRoles={["super_admin"]}>
 *   <button>Delete All Users</button>
 * </RoleGuard>
 *
 * @example
 * // Admins and Super Admins can see this
 * <RoleGuard allowedRoles={["super_admin", "admin"]}>
 *   <ManageClientsPanel />
 * </RoleGuard>
 */
export const RoleGuard = ({
  children,
  allowedRoles,
  fallback,
}: RoleGuardProps) => {
  const { hasAccess } = useAuth();

  if (!hasAccess(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view this content.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

/**
 * Hook to use role-based rendering in components
 *
 * @example
 * const { canAccess } = useRoleAccess();
 *
 * if (canAccess(["super_admin"])) {
 *   return <AdminPanel />;
 * }
 */
export const useRoleAccess = () => {
  const { hasAccess, isSuperAdmin, isAdmin, isTrainee, currentUserRole } =
    useAuth();

  return {
    canAccess: hasAccess,
    isSuperAdmin,
    isAdmin,
    isTrainee,
    currentUserRole,
  };
};
