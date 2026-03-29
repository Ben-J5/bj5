import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("items router", () => {
  it("should list all items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.items.list();

    expect(Array.isArray(items)).toBe(true);
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("id");
      expect(items[0]).toHaveProperty("title");
      expect(items[0]).toHaveProperty("price");
    }
  });

  it("should get item by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First get all items to find a valid id
    const items = await caller.items.list();
    if (items.length > 0) {
      const firstItemId = items[0].id;
      const item = await caller.items.getById({ id: firstItemId });

      expect(item).toBeDefined();
      expect(item?.id).toBe(firstItemId);
      expect(item?.title).toBeDefined();
      expect(item?.price).toBeDefined();
    }
  });
});
