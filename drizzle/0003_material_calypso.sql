CREATE TABLE "video_upload_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_email" varchar(255) NOT NULL,
	"completion_token" varchar(128) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"metadata" text NOT NULL,
	"google_drive_file_id" varchar(255),
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_upload_sessions_completion_token_unique" UNIQUE("completion_token")
);
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "google_drive_file_id" varchar(255);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "google_drive_folder_id" varchar(255);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "original_filename" varchar(255);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mime_type" varchar(100);--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "file_size" bigint;--> statement-breakpoint
CREATE INDEX "video_upload_sessions_expires_at_idx" ON "video_upload_sessions" USING btree ("expires_at");