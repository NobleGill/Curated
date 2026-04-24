import { Router, type IRouter, type Request, type Response } from "express";
import { db, itemsTable, outfitsTable, outfitItemsTable } from "@workspace/db";
import { and, eq, desc, inArray } from "drizzle-orm";
import { SaveOutfitBody, DeleteOutfitParams, SuggestOutfitBody } from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/requireAuth";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

function serializeItem(row: typeof itemsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    color: row.color,
    imagePath: row.imagePath,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/outfits", requireAuth, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const outfits = await db
    .select()
    .from(outfitsTable)
    .where(eq(outfitsTable.userId, userId))
    .orderBy(desc(outfitsTable.createdAt));

  if (outfits.length === 0) {
    res.json([]);
    return;
  }

  const links = await db
    .select()
    .from(outfitItemsTable)
    .where(
      inArray(
        outfitItemsTable.outfitId,
        outfits.map((o) => o.id),
      ),
    );

  const itemIds = Array.from(new Set(links.map((l) => l.itemId)));
  const items = itemIds.length
    ? await db.select().from(itemsTable).where(inArray(itemsTable.id, itemIds))
    : [];
  const itemsById = new Map(items.map((i) => [i.id, i]));

  res.json(
    outfits.map((o) => ({
      id: o.id,
      name: o.name,
      createdAt: o.createdAt.toISOString(),
      items: links
        .filter((l) => l.outfitId === o.id)
        .map((l) => itemsById.get(l.itemId))
        .filter((x): x is typeof itemsTable.$inferSelect => !!x)
        .map(serializeItem),
    })),
  );
});

router.get("/outfits/random", requireAuth, async (req: Request, res: Response) => {
  const all = await db
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.userId, getUserId(req)));
  const byCategory = new Map<string, typeof itemsTable.$inferSelect[]>();
  for (const item of all) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  const order = ["outerwear", "top", "bottom", "shoes", "accessory"];
  const picked: typeof itemsTable.$inferSelect[] = [];
  for (const cat of order) {
    const list = byCategory.get(cat);
    if (list && list.length > 0) {
      picked.push(list[Math.floor(Math.random() * list.length)]);
    }
  }
  res.json({ items: picked.map(serializeItem) });
});

router.post("/outfits/suggest", requireAuth, async (req: Request, res: Response) => {
  const parsed = SuggestOutfitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const userId = getUserId(req);
  const all = await db.select().from(itemsTable).where(eq(itemsTable.userId, userId));

  if (all.length === 0) {
    res.status(400).json({ error: "Your closet is empty. Add some items first." });
    return;
  }

  const wardrobe = all.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    color: i.color ?? "unspecified",
  }));

  const systemPrompt = `You are a warm, thoughtful personal stylist helping someone choose what to wear from their own closet. You will receive their wardrobe as JSON and a short description of the occasion or vibe they want. Pick at most one item per category from these categories: outerwear, top, bottom, shoes, accessory. You may skip a category if nothing fits the request (for example, no outerwear on a hot day). Reply ONLY with strict JSON in this shape:
{
  "itemIds": [<numbers from the wardrobe>],
  "reasoning": "<2-3 short sentences explaining why this combination works for the request, in a conversational tone>",
  "suggestedName": "<a short outfit name, 2-5 words, evoking the occasion>"
}
Only choose ids that appear in the wardrobe. Never invent items.`;

  const userMessage = `Wardrobe:\n${JSON.stringify(wardrobe)}\n\nThe occasion / vibe: ${parsed.data.prompt}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    let payload: { itemIds?: unknown; reasoning?: unknown; suggestedName?: unknown };
    try {
      payload = JSON.parse(content);
    } catch {
      res.status(502).json({ error: "Stylist returned an invalid response. Try again." });
      return;
    }

    const validIds = new Set(all.map((i) => i.id));
    const chosenIds = Array.isArray(payload.itemIds)
      ? payload.itemIds.filter((x): x is number => typeof x === "number" && validIds.has(x))
      : [];

    if (chosenIds.length === 0) {
      res.status(502).json({ error: "Stylist couldn't find a fit. Try a different vibe." });
      return;
    }

    const itemsById = new Map(all.map((i) => [i.id, i]));
    const items = chosenIds
      .map((id) => itemsById.get(id))
      .filter((x): x is typeof itemsTable.$inferSelect => !!x);

    res.json({
      items: items.map(serializeItem),
      reasoning: typeof payload.reasoning === "string" ? payload.reasoning : "",
      suggestedName:
        typeof payload.suggestedName === "string" && payload.suggestedName.trim().length > 0
          ? payload.suggestedName
          : "Stylist's pick",
    });
  } catch (error) {
    req.log.error({ err: error }, "AI suggestion failed");
    res.status(500).json({ error: "Stylist had a hiccup. Please try again." });
  }
});

router.post("/outfits", requireAuth, async (req: Request, res: Response) => {
  const parsed = SaveOutfitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, itemIds } = parsed.data;
  const userId = getUserId(req);
  const ownedItems = itemIds.length
    ? await db
        .select()
        .from(itemsTable)
        .where(and(inArray(itemsTable.id, itemIds), eq(itemsTable.userId, userId)))
    : [];
  if (ownedItems.length !== itemIds.length) {
    res.status(400).json({ error: "Invalid item ids" });
    return;
  }
  const [outfit] = await db
    .insert(outfitsTable)
    .values({ userId, name })
    .returning();
  if (itemIds.length > 0) {
    await db
      .insert(outfitItemsTable)
      .values(itemIds.map((itemId) => ({ outfitId: outfit.id, itemId })));
  }
  const itemsById = new Map(ownedItems.map((i) => [i.id, i]));
  res.json({
    id: outfit.id,
    name: outfit.name,
    createdAt: outfit.createdAt.toISOString(),
    items: itemIds
      .map((id) => itemsById.get(id))
      .filter((x): x is typeof itemsTable.$inferSelect => !!x)
      .map(serializeItem),
  });
});

router.delete("/outfits/:id", requireAuth, async (req: Request, res: Response) => {
  const parsed = DeleteOutfitParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(outfitsTable)
    .where(and(eq(outfitsTable.id, parsed.data.id), eq(outfitsTable.userId, getUserId(req))));
  res.json({ ok: true });
});

export default router;
