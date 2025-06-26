import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { todo, todoAssignees } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like } from "drizzle-orm";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        completed: z.boolean(),
        assignedIds: z.array(z.string()).optional(),
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

      if (input.assignedIds?.length) {
        await ctx.db.insert(todoAssignees).values(
          input.assignedIds.map((userId) => ({
            todoId: newTodo.id,
            userId,
          })),
        );
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
        userId: z.string().optional(),
        assigneeId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const todos = await ctx.db.query.todo.findMany({
        where: and(
          input.completed !== null
            ? eq(todo.completed, input.completed)
            : undefined,
          input.search !== null
            ? like(todo.title, `%${input.search}%`)
            : undefined,
          input.userId ? eq(todo.userId, input.userId) : undefined,
        ),
        orderBy: desc(todo.createdAt),
      });

      const allAssignees = await ctx.db.query.todoAssignees.findMany();

      let todosWithAssignees = todos.map((t) => ({
        ...t,
        assigneeIds: allAssignees
          .filter((a) => a.todoId === t.id)
          .map((a) => a.userId),
      }));

      if (input.assigneeId) {
        todosWithAssignees = todosWithAssignees.filter((t) =>
          t.assigneeIds.includes(input.assigneeId!),
        );
      }

      return todosWithAssignees;
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const todoItem = await ctx.db.query.todo.findFirst({
        where: eq(todo.id, input.id),
      });

      if (!todoItem) return null;

      const assignees = await ctx.db.query.todoAssignees.findMany({
        where: eq(todoAssignees.todoId, input.id),
      });

      return {
        ...todoItem,
        assigneeIds: assignees.map((a) => a.userId),
      };
    }),

  assignUsers: protectedProcedure
    .input(
      z.object({
        todoId: z.number(),
        userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(todoAssignees)
        .where(eq(todoAssignees.todoId, input.todoId));

      await ctx.db.insert(todoAssignees).values(
        input.userIds.map((userId) => ({
          todoId: input.todoId,
          userId,
        })),
      );

      return { success: true };
    }),
});
