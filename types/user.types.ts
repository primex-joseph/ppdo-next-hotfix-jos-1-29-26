// types/user.types.ts - TypeScript types

import { Id } from "@/convex/_generated/dataModel";

export interface User {
  _id: string;
  name?: string;
  email?: string;
  role?: "super_admin" | "admin" | "user";
  departmentId?: Id<"departments">;
  departmentName?: string;
  position?: string;
  employeeId?: string;
  status?: "active" | "inactive" | "suspended";
  lastLogin?: number;
  createdAt?: number;
  updatedAt?: number;
  suspensionReason?: string;
  image?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: "super_admin" | "admin" | "user";
  departmentId?: Id<"departments">;
  departmentName?: string; // <--- ADDED
  position?: string;
  employeeId?: string;
  status?: "active" | "inactive" | "suspended"; // <--- ADDED
  suspensionReason?: string; // <--- ADDED
}

export interface UserFilters {
  search: string;
  role: "all" | "super_admin" | "admin" | "user";
  status: "all" | "active" | "inactive" | "suspended";
  departmentId?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
}