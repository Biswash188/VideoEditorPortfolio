import { asc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contactRequests,
  type ContactRequest,
  type ContactRequestStatus,
  type NewContactRequest,
} from "./schema";

export type CreateContactRequest = Omit<
  NewContactRequest,
  "id" | "createdAt" | "status"
>;
export type UpdateContactRequest = {
  status: ContactRequestStatus;
};

export async function listContactRequests(): Promise<ContactRequest[]> {
  return getDatabase()
    .select()
    .from(contactRequests)
    .orderBy(asc(contactRequests.status), asc(contactRequests.createdAt));
}

export async function getContactRequestById(
  id: string,
): Promise<ContactRequest | undefined> {
  const [contactRequest] = await getDatabase()
    .select()
    .from(contactRequests)
    .where(eq(contactRequests.id, id))
    .limit(1);

  return contactRequest;
}

export async function createContactRequest(
  input: CreateContactRequest,
): Promise<ContactRequest> {
  const [contactRequest] = await getDatabase()
    .insert(contactRequests)
    .values(input)
    .returning();

  return contactRequest;
}

export async function updateContactRequest(
  id: string,
  input: UpdateContactRequest,
): Promise<ContactRequest | undefined> {
  const [contactRequest] = await getDatabase()
    .update(contactRequests)
    .set(input)
    .where(eq(contactRequests.id, id))
    .returning();

  return contactRequest;
}

export async function deleteContactRequest(
  id: string,
): Promise<ContactRequest | undefined> {
  const [contactRequest] = await getDatabase()
    .delete(contactRequests)
    .where(eq(contactRequests.id, id))
    .returning();

  return contactRequest;
}