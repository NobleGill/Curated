import { Router, type IRouter, type Request, type Response } from "express";
import { db, itemsTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import {
  ListItemsQueryParams,
  CreateItemBody,
  DeleteItemParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/requireAuth";

const router: IRouter = Router();

function serialize(row: typeof itemsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    color: row.color,
    imagePath: row.imagePath,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/items", requireAuth, async (req: Request, res: Response) => {
  const parsed = ListItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const userId = getUserId(req);
  const { category } = parsed.data;
  const where = category
    ? and(eq(itemsTable.userId, userId), eq(itemsTable.category, category))
    : eq(itemsTable.userId, userId);
  const rows = await db
    .select()
    .from(itemsTable)
    .where(where)
    .orderBy(desc(itemsTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/items", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, category, color, imagePath } = parsed.data;
  const [row] = await db
    .insert(itemsTable)
    .values({ userId: getUserId(req), name, category, color: color ?? null, imagePath })
    .returning();
  res.json(serialize(row));
});

router.delete("/items/:id", requireAuth, async (req: Request, res: Response) => {
  const parsed = DeleteItemParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(itemsTable)
    .where(and(eq(itemsTable.id, parsed.data.id), eq(itemsTable.userId, getUserId(req))));
  res.json({ ok: true });
});

export default router;
