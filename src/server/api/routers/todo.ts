import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { todo } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like } from "drizzle-orm";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        completed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newTodo] = await ctx.db
        .insert(todo)
        .values([
          {
            title: input.title,
            completed: input.completed,
            userId: ctx.session.user.id,
          },
        ])
        .returning();

      if (!newTodo) {
        throw new TRPCError({
          message: "Cannot create todo!",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return newTodo;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string(),
          completed: z.boolean(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedTodo] = await ctx.db
        .update(todo)
        .set(input.data)
        .where(and(eq(todo.id, input.id), eq(todo.userId, ctx.session.user.id)))
        .returning();

      if (!updatedTodo) {
        throw new TRPCError({
          message: "Cannot create todo!",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      console.log("updatedTodo: ", updatedTodo);

      return updatedTodo;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [data] = await ctx.db
        .delete(todo)
        .where(and(eq(todo.id, input.id), eq(todo.userId, ctx.session.user.id)))
        .returning();

      if (!data) {
        throw new TRPCError({
          message: "Cannot create todo!",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
      return data;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        completed: z.boolean().nullable().default(null),
        search: z.string().nullable().default(null),
      }),
    )
    .query(async ({ ctx, input }) => {
      const todos = await ctx.db.query.todo.findMany({
        where: and(
          input.completed !== null
            ? eq(todo.completed, input.completed)
            : undefined,

          // input.search !== null?
          input.search !== null
            ? like(todo.title, `%${input.search}%`)
            : undefined,
          eq(todo.userId, ctx.session.user.id),
        ),
        orderBy: desc(todo.createdAt),
      });

      return todos;
    }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.todo.findFirst({
        where: and(eq(todo.id, input.id), eq(todo.userId, ctx.session.user.id)),
      });
      return data;
    }),
});
