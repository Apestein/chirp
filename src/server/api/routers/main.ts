import { z } from "zod"
import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const mainRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    })
    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map((user) => ({
      id: user.id,
      username: user.username,
      image: user.profileImageUrl,
    }))
    const postsWithUser = posts.map((post) => ({
      post,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      author: users.find((user) => user.id === post.authorId)!,
    }))
    return postsWithUser
  }),
})
