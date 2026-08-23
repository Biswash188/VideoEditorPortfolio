import { index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar, boolean } from "drizzle-orm/pg-core";

export const contactRequestStatus = pgEnum("contact_request_status", [
  "new",
  "in_progress",
  "closed",
]);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull().default(""),
    category: varchar("category", { length: 100 }).notNull(),
    // Vercel Blob object URLs are stored here; media bytes never enter Postgres.
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    durationSeconds: integer("duration_seconds"),
    isPublished: boolean("is_published").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("videos_category_idx").on(table.category),
    index("videos_featured_display_order_idx").on(
      table.isFeatured,
      table.displayOrder,
    ),
  ],
);

export const contactRequests = pgTable(
  "contact_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    projectType: varchar("project_type", { length: 100 }).notNull(),
    message: text("message").notNull(),
    status: contactRequestStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("contact_requests_status_created_at_idx").on(
      table.status,
      table.createdAt,
    ),
  ],
);

export type VideoProject = typeof videos.$inferSelect;
export type NewVideoProject = typeof videos.$inferInsert;
export type ContactRequest = typeof contactRequests.$inferSelect;
export type NewContactRequest = typeof contactRequests.$inferInsert;
export type ContactRequestStatus = (typeof contactRequestStatus.enumValues)[number];
