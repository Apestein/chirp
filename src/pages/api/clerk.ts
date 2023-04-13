import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "~/server/db"
import type { User } from "@clerk/nextjs/dist/api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  type clerkInfo = {
    object: string
    type: string
    data: User
  }
  const { data: user } = req.body as clerkInfo
  const createdUser = await prisma.user.create({
    data: {
      id: user.id,
      username: user.username ?? "N/A",
      profileImageUrl: user.profileImageUrl,
    },
  })
  res.status(201).json(createdUser)
}
