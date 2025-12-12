// app/dashboard/settings/user-management/hooks/useUserManagement.ts

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";

export interface UserFormData {
  name: string;
  email: string;
  role: "super_admin" | "admin" | "user";
  departmentId?: Id<"departments">;
  position?: string;
  employeeId?: string;
  status: "active" | "inactive" | "suspended";
  suspensionReason?: string;
}

export function useUserManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries - Fixed to pass empty objects as arguments
  const users = useQuery(api.auth.listAllUsers, {});
  const departments = useQuery(api.departments.list, {});

  // Mutations
  const updateUserRole = useMutation(api.auth.updateUserRole);
  const updateUserStatus = useMutation(api.auth.updateUserStatus);
  const updateUserDepartment = useMutation(api.auth.updateUserDepartment);

  // Update role
  const handleUpdateRole = async (
    userId: Id<"users">,
    newRole: "super_admin" | "admin" | "user"
  ) => {
    try {
      setIsSubmitting(true);
      await updateUserRole({ userId, newRole });
      
      toast.success("User role updated successfully");
      
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update status
  const handleUpdateStatus = async (
    userId: Id<"users">,
    newStatus: "active" | "inactive" | "suspended",
    reason?: string
  ) => {
    try {
      setIsSubmitting(true);
      await updateUserStatus({ userId, newStatus, reason });
      
      toast.success("User status updated successfully");
      
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update department
  const handleUpdateDepartment = async (
    userId: Id<"users">,
    departmentId?: Id<"departments">
  ) => {
    try {
      setIsSubmitting(true);
      await updateUserDepartment({ userId, departmentId });
      
      toast.success("User department updated successfully");
      
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update user department");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk update user
  const handleUpdateUser = async (
    userId: Id<"users">,
    data: Partial<UserFormData>
  ) => {
    try {
      setIsSubmitting(true);
      
      // Update role if provided
      if (data.role) {
        await updateUserRole({ userId, newRole: data.role });
      }
      
      // Update status if provided
      if (data.status) {
        await updateUserStatus({
          userId,
          newStatus: data.status,
          reason: data.suspensionReason,
        });
      }
      
      // Update department if provided
      if (data.departmentId !== undefined) {
        await updateUserDepartment({ userId, departmentId: data.departmentId });
      }
      
      toast.success("User updated successfully");
      
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    users,
    departments,
    isLoading: users === undefined || departments === undefined,
    isSubmitting,
    updateRole: handleUpdateRole,
    updateStatus: handleUpdateStatus,
    updateDepartment: handleUpdateDepartment,
    updateUser: handleUpdateUser,
  };
}