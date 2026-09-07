import { index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar, boolean, bigint } from "drizzle-orm/pg-core";

export const contactRequestStatus = pgEnum("contact_request_status", [
  "new",
  "read",
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
    googleDriveFileId: varchar("google_drive_file_id", { length: 255 }),
    googleDriveFolderId: varchar("google_drive_folder_id", { length: 255 }),
    originalFilename: varchar("original_filename", { length: 255 }),
    mimeType: varchar("mime_type", { length: 100 }),
    fileSize: bigint("file_size", { mode: "number" }),
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

export const uploadSessions = pgTable("video_upload_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  completionToken: varchar("completion_token", { length: 128 }).notNull().unique(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  metadata: text("metadata").notNull(),
  googleDriveFileId: varchar("google_drive_file_id", { length: 255 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("video_upload_sessions_expires_at_idx").on(table.expiresAt)]);

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
