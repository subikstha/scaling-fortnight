import { User } from "@/drizzle/schema";

type Permission =
  | "project:create"
  | "project:update"
  | "project:read:all"
  | "project:read:own-department"
  | "project:read:global-department"
  | "project:delete"
  | "document:create"
  | "document:update"
  | "document:read"
  | "document:delete";

const permissionsByRole: Record<User["role"], Permission[]> = {
  admin: [
    "project:create",
    "project:read:all",
    "project:update",
    "project:delete",
    "document:create",
    "document:update",
    "document:read",
    "document:delete",
  ],
  author: [
    "project:read:global-department",
    "project:read:own-department",
    "document:create",
    "document:read",
    "document:update",
  ],
  editor: [
    "project:read:global-department",
    "project:read:own-department",
    "document:read",
    "document:update",
  ],
  viewer: [
    "project:read:global-department",
    "project:read:own-department",
    "document:read",
  ],
};

export function can(user: Pick<User, "role"> | null, permission: Permission) {
  if (user == null) return false;
  return permissionsByRole[user.role].includes(permission);
}
