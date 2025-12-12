// 4. lib/rbac.ts - Client-side RBAC helpers

import { User } from "../types/user.types";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  user: "User",
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: "destructive",
  admin: "default",
  user: "secondary",
};

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export function canManageUsers(role?: string): boolean {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function canManageRole(
  currentUserRole?: string,
  targetRole?: string
): boolean {
  if (currentUserRole === ROLES.SUPER_ADMIN) return true;
  if (currentUserRole === ROLES.ADMIN) {
    return targetRole !== ROLES.SUPER_ADMIN;
  }
  return false;
}

export function canDeleteUser(currentUser?: any, targetUser?: any): boolean {
  if (!currentUser || !targetUser) return false;
  if (currentUser._id === targetUser._id) return false;

  if (currentUser.role === ROLES.SUPER_ADMIN) return true;
  if (currentUser.role === ROLES.ADMIN) {
    return targetUser.role !== ROLES.SUPER_ADMIN;
  }
  return false;
}

export function canEditUser(currentUser?: any, targetUser?: any): boolean {
  if (!currentUser || !targetUser) return false;
  if (currentUser._id === targetUser._id) return true; // Can edit self

  return canDeleteUser(currentUser, targetUser);
}