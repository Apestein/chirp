import { z } from "zod"
import { clerkClient } from "@clerk/nextjs/server"
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
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    })
    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map((user) => ({
      id: user.id,
      username: user.username!,
      image: user.profileImageUrl,
    }))
    const postsWithUser = posts.map((post) => ({
      post,
      author: users.find((user) => user.id === post.authorId)!,
    }))
    return postsWithUser
  }),
  getAllByUser: publicProcedure
    .input(
      z.object({
        authorId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(input.authorId)
      const userFiltered = {
        id: user.id,
        username: user.username!,
        image: user.profileImageUrl,
      }
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.authorId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      })
      return { posts, author: userFiltered }
    }),
  getPostById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        authorId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(input.authorId)
      const userFiltered = {
        id: user.id,
        username: user.username!,
        image: user.profileImageUrl,
      }
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      })
      if (!post) throw new TRPCError({ code: "NOT_FOUND" })
      return { post, author: userFiltered }
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .emoji("Only emojis are allowed")
          .min(1, "Message is empty")
          .max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId

      const { success } = await ratelimit.limit(authorId)
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      })
      return post
    }),
})
