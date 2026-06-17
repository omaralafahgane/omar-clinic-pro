import { NextRequest, NextResponse } from "next/server";
import { hasPermission, Permission, Role } from "./roles";

export function requirePermission(requiredPermission: Permission) {
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]) => {
      const userRole = request.headers.get("x-user-role") as Role;

      if (!userRole || !hasPermission(userRole, requiredPermission)) {
        return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
      }

      return handler(request, ...args);
    };
  };
}
