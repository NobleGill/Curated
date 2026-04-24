import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const itemsTable = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color"),
  imagePath: text("image_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const outfitsTable = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const outfitItemsTable = pgTable("outfit_items", {
  id: serial("id").primaryKey(),
  outfitId: integer("outfit_id")
    .notNull()
    .references(() => outfitsTable.id, { onDelete: "cascade" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => itemsTable.id, { onDelete: "cascade" }),
});

export type Item = typeof itemsTable.$inferSelect;
export type NewItem = typeof itemsTable.$inferInsert;
export type Outfit = typeof outfitsTable.$inferSelect;
