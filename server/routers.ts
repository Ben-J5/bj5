import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getAllItems, getItemById, getOrCreateConversation, getConversationMessages, createMessage, getUserConversations, getConversationById } from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  items: router({
    list: publicProcedure.query(async () => {
      return getAllItems();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getItemById(input.id);
    }),
  }),

  conversations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserConversations(ctx.user.id);
    }),
    getOrCreate: protectedProcedure
      .input(z.object({ itemId: z.number(), sellerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return getOrCreateConversation(input.itemId, ctx.user.id, input.sellerId);
      }),
  }),

  messages: router({
    getByConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify user is part of this conversation
        const conv = await getConversationById(input.conversationId);
        if (!conv || (conv.buyerId !== ctx.user.id && conv.sellerId !== ctx.user.id)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
        }
        return getConversationMessages(input.conversationId);
      }),
    send: protectedProcedure
      .input(z.object({ conversationId: z.number(), content: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // Verify user is part of this conversation
        const conv = await getConversationById(input.conversationId);
        if (!conv || (conv.buyerId !== ctx.user.id && conv.sellerId !== ctx.user.id)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
        }
        return createMessage(input.conversationId, ctx.user.id, input.content);
      }),
  }),
});

export type AppRouter = typeof appRouter;
