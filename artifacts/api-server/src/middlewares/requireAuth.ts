import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export function getUserId(req: Request): string {
  const auth = getAuth(req);
  const userId =
    (auth?.sessionClaims as { userId?: string } | undefined)?.userId || auth?.userId;
  if (!userId) {
    throw new Error("Missing userId — requireAuth must run first");
  }
  return userId;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId =
    (auth?.sessionClaims as { userId?: string } | undefined)?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
