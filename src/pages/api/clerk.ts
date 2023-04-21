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
      first_name: string
      last_name: string
    }
  }
  const { data: user } = req.body as clerkEvent
  const name = user.username ?? `${user.first_name} ${user.last_name}`
  const createdUser = await prisma.user.create({
    data: {
      id: user.id,
      username: name,
      profileImageUrl: user.profile_image_url,
    },
  })

  res.status(201).json(createdUser)
}
