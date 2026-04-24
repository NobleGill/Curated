import { Router, type IRouter, type Request, type Response } from "express";
import { db, itemsTable, outfitsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, getUserId } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/summary", requireAuth, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const [{ count: totalItems }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(itemsTable)
    .where(eq(itemsTable.userId, userId));
  const [{ count: savedOutfits }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(outfitsTable)
    .where(eq(outfitsTable.userId, userId));
  const grouped = await db
    .select({
      category: itemsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(itemsTable)
    .where(eq(itemsTable.userId, userId))
    .groupBy(itemsTable.category);

  res.json({
    totalItems: totalItems ?? 0,
    savedOutfits: savedOutfits ?? 0,
    byCategory: grouped.map((g) => ({ category: g.category, count: g.count })),
  });
});

export default router;
