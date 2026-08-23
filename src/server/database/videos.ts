import { asc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { videos, type NewVideoProject, type VideoProject } from "./schema";

export type CreateVideoProject = Omit<
  NewVideoProject,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateVideoProject = Partial<CreateVideoProject>;

export async function listVideos(): Promise<VideoProject[]> {
  return getDatabase()
    .select()
    .from(videos)
    .orderBy(asc(videos.displayOrder), asc(videos.createdAt));
}

export async function listPublishedVideos(): Promise<VideoProject[]> {
  return getDatabase()
    .select()
    .from(videos)
    .where(eq(videos.isPublished, true))
    .orderBy(asc(videos.displayOrder), asc(videos.createdAt));
}

export async function getVideoById(id: string): Promise<VideoProject | undefined> {
  const [video] = await getDatabase()
    .select()
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);

  return video;
}

export async function getVideoByBlobUrl(
  videoUrl: string,
): Promise<VideoProject | undefined> {
  const [video] = await getDatabase()
    .select()
    .from(videos)
    .where(eq(videos.videoUrl, videoUrl))
    .limit(1);

  return video;
}

export async function createVideo(
  input: CreateVideoProject,
): Promise<VideoProject> {
  const [video] = await getDatabase().insert(videos).values(input).returning();
  return video;
}

export async function updateVideo(
  id: string,
  input: UpdateVideoProject,
): Promise<VideoProject | undefined> {
  const [video] = await getDatabase()
    .update(videos)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(videos.id, id))
    .returning();

  return video;
}

export async function deleteVideo(id: string): Promise<VideoProject | undefined> {
  const [video] = await getDatabase()
    .delete(videos)
    .where(eq(videos.id, id))
    .returning();

  return video;
}
