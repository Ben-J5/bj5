import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, items, conversations, messages } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Items queries
export async function getAllItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(items);
}

export async function getItemById(itemId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Conversations queries
export async function getOrCreateConversation(itemId: number, buyerId: number, sellerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Use a combination of itemId, buyerId, and sellerId to ensure uniqueness
  const { and, eq: eqOp } = await import('drizzle-orm');
  const existing = await db.select().from(conversations)
    .where(
      and(
        eqOp(conversations.itemId, itemId),
        eqOp(conversations.buyerId, buyerId),
        eqOp(conversations.sellerId, sellerId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new conversation
  await db.insert(conversations).values({
    itemId,
    buyerId,
    sellerId,
  });
  
  // Fetch the newly created conversation
  const { and: andOp, eq: eqOp2 } = await import('drizzle-orm');
  const newConv = await db.select().from(conversations)
    .where(
      andOp(
        eqOp2(conversations.itemId, itemId),
        eqOp2(conversations.buyerId, buyerId),
        eqOp2(conversations.sellerId, sellerId)
      )
    )
    .limit(1);
  
  return newConv.length > 0 ? newConv[0] : undefined;
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { or } = await import('drizzle-orm');
  // Get conversations where user is either buyer or seller
  return db.select().from(conversations)
    .where(
      or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId)
      )
    )
    .orderBy(conversations.lastMessageAt);
}

// Messages queries
export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  const { asc } = await import('drizzle-orm');
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function createMessage(conversationId: number, senderId: number, content: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.insert(messages).values({
    conversationId,
    senderId,
    content,
  });
  
  // Update conversation's lastMessageAt
  await db.update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));
  
  return true;
}
