import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "~/server/db"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  type clerkEvent = {
    object: string
    type: string
    data: {
      id: string
      username: string
      profile_image_url: string
    }
  }
  const { data: user } = req.body as clerkEvent
  const createdUser = await prisma.user.create({
    data: {
      id: user.id,
      username: user.username ?? "N/A",
      profileImageUrl: user.profile_image_url,
    },
  })
  res.status(201).json(createdUser)
}
