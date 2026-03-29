import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createProtectedContext(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("conversations router", () => {
  it("should create or get conversation", async () => {
    const buyerCtx = createProtectedContext(1);
    const caller = appRouter.createCaller(buyerCtx);

    const conversation = await caller.conversations.getOrCreate({
      itemId: 1,
      sellerId: 2,
    });

    expect(conversation).toBeDefined();
    expect(conversation?.itemId).toBe(1);
    expect(conversation?.buyerId).toBe(1);
    expect(conversation?.sellerId).toBe(2);
  });

  it("should list user conversations", async () => {
    const buyerCtx = createProtectedContext(1);
    const caller = appRouter.createCaller(buyerCtx);

    // Create a conversation first
    await caller.conversations.getOrCreate({
      itemId: 1,
      sellerId: 2,
    });

    const conversations = await caller.conversations.list();

    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThan(0);
  });
});

describe("messages router", () => {
  it("should send and retrieve messages", async () => {
    const buyerCtx = createProtectedContext(1);
    const sellerCtx = createProtectedContext(2);
    const buyerCaller = appRouter.createCaller(buyerCtx);
    const sellerCaller = appRouter.createCaller(sellerCtx);

    // Create conversation
    const conversation = await buyerCaller.conversations.getOrCreate({
      itemId: 1,
      sellerId: 2,
    });

    if (!conversation) throw new Error("Conversation not created");

    // Send message from buyer
    const sendResult = await buyerCaller.messages.send({
      conversationId: conversation.id,
      content: "Hello, is this still available?",
    });

    expect(sendResult).toBe(true);

    // Retrieve messages as seller
    const messages = await sellerCaller.messages.getByConversation({
      conversationId: conversation.id,
    });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]?.content).toBe("Hello, is this still available?");
  });

  it("should prevent unauthorized access to messages", async () => {
    const buyerCtx = createProtectedContext(1);
    const unauthorizedCtx = createProtectedContext(999);
    const buyerCaller = appRouter.createCaller(buyerCtx);
    const unauthorizedCaller = appRouter.createCaller(unauthorizedCtx);

    // Create conversation
    const conversation = await buyerCaller.conversations.getOrCreate({
      itemId: 1,
      sellerId: 2,
    });

    if (!conversation) throw new Error("Conversation not created");

    // Try to access messages as unauthorized user
    try {
      await unauthorizedCaller.messages.getByConversation({
        conversationId: conversation.id,
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
