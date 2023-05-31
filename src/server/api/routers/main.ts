import { z } from "zod"
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { TRPCError } from "@trpc/server"
import Pusher from "pusher"
import { env } from "~/env.mjs"
import { type PrismaClient } from "@prisma/client"

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: "mt1",
  useTLS: true,
})

// Create a new ratelimiter, that allows 2 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "10 s"),
  analytics: true,
})

export const mainRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 100
      const cursor = input.cursor
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        where: {
          originPostId: null,
        },
        cursor: cursor ? { id: cursor } : undefined,
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
      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
      }

      return { posts, nextCursor }
    }),
  getFollowing: privateProcedure.query(async ({ ctx }) => {
    const usersFollowed = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.userId,
      },
      select: {
        follows: {
          select: {
            posts: {
              include: {
                user: true,
                _count: {
                  select: { likedBy: true, comments: true },
                },
                likedBy: {
                  where: {
                    id: ctx.userId,
                  },
                },
              },
            },
          },
        },
      },
    })
    return usersFollowed
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
          user: {
            include: {
              followers: {
                where: {
                  id: ctx.userId ?? "",
                },
              },
              _count: {
                select: { followers: true, follows: true },
              },
            },
          },
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
        content: z.string().min(1, "Message is empty").max(255),
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

      void pusher.trigger("my-channel", "my-event", "")
      //if comment, create notification
      if (input.originPostId)
        void handleNotification(
          authorId,
          input.originPostId,
          "comment",
          `${ctx.userId} commented`,
          ctx.prisma
        )
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
  updateFollowers: privateProcedure
    .input(
      z.object({
        userToFollowId: z.string().min(1).max(255),
        isFollowed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId
      if (userId === input.userToFollowId)
        throw new TRPCError({ code: "FORBIDDEN" })
      if (input.isFollowed)
        await ctx.prisma.user.update({
          where: {
            id: input.userToFollowId,
          },
          data: {
            followers: {
              disconnect: { id: userId },
            },
          },
        })
      else
        await ctx.prisma.user.update({
          where: {
            id: input.userToFollowId,
          },
          data: {
            followers: {
              connect: { id: userId },
            },
          },
        })
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(3).max(255),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.post.findMany({
        where: {
          content: {
            search: input.query,
          },
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
        },
      })
      return result
    }),
  // createNotification: privateProcedure
  //   .input(
  //     z.object({
  //       originPostId: z.string().min(1),
  //       message: z.string().min(1).max(255),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const authorId = ctx.userId
  //     const post = await ctx.prisma.post.findUnique({
  //       where: {
  //         id: input.originPostId,
  //       },
  //     })
  //     if (!post?.authorId) throw new TRPCError({ code: "NOT_FOUND" })
  //     void ctx.prisma.notification.create({
  //       data: {
  //         fromUserId: authorId,
  //         toUserId: post.authorId,
  //         postId: input.originPostId,
  //         likeOrComment: "comment",
  //         message: input.message,
  //       },
  //     })
  //   }),
})

async function handleNotification(
  authorId: string,
  originPostId: string,
  likeOrComment: "like" | "comment",
  message: string,
  prisma: PrismaClient
) {
  const post = await prisma.post.findUnique({
    where: {
      id: originPostId,
    },
  })
  if (!post?.authorId) throw new TRPCError({ code: "NOT_FOUND" })
  await prisma.notification.create({
    data: {
      fromUserId: authorId,
      toUserId: post.authorId,
      postId: originPostId,
      likeOrComment,
      message: message,
    },
  })
}
