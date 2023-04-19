import { z } from "zod"
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { TRPCError } from "@trpc/server"

// Create a new ratelimiter, that allows 2 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "10 s"),
  analytics: true,
})

export const mainRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: {
        originPostId: null,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
      include: {
        user: true,
        _count: {
          select: { likedBy: true, comments: true },
        },
        likedBy: {
          where: {
            id: ctx.userId ?? "",
          },
        },
      },
    })
    return posts
  }),
  getAllByUser: publicProcedure
    .input(
      z.object({
        authorId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.authorId,
        },
        orderBy: [{ createdAt: "desc" }],
        include: {
          user: true,
          _count: {
            select: { likedBy: true, comments: true },
          },
          likedBy: {
            where: {
              id: ctx.userId ?? "",
            },
          },
        },
      })
      return posts
    }),
  getPostById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        include: {
          user: true,
          _count: {
            select: { likedBy: true, comments: true },
          },
          likedBy: {
            where: {
              id: ctx.userId ?? "",
            },
          },
          comments: {
            take: 100,
            orderBy: [{ createdAt: "desc" }],
            include: {
              user: true,
              _count: {
                select: { likedBy: true, comments: true },
              },
              likedBy: {
                where: {
                  id: ctx.userId ?? "",
                },
              },
            },
          },
        },
      })
      if (!post) throw new TRPCError({ code: "NOT_FOUND" })
      return post
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .emoji("Only emojis are allowed")
          .min(1, "Message is empty")
          .max(280),
        originPostId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId
      const { success } = await ratelimit.limit(authorId)
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
      await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
          originPostId: input.originPostId,
        },
      })
    }),
  updateLikes: privateProcedure
    .input(
      z.object({
        postId: z.string().min(1).max(255),
        isLiked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId
      if (input.isLiked)
        await ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            likedBy: {
              disconnect: { id: userId },
            },
          },
        })
      else
        await ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            likedBy: {
              connect: { id: userId },
            },
          },
        })
    }),
})
