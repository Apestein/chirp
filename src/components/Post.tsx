import type { RouterOutputs } from "~/utils/api"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["main"]["getAll"][number]
export default function Post(props: PostWithUser) {
  const { id, authorId, createdAt, content, user } = props
  return (
    <li className="flex items-center gap-3 border-b border-b-[#ffffff50] py-3 pl-3">
      <Image
        src={user.profileImageUrl}
        alt="profile-image"
        width={64}
        height={64}
        className="w-16 rounded-full"
      />
      <Link href={`post/${id}`}>
        <Link href={`@${user.username}?authorId=${authorId}`}>
          {user.username} · {dayjs(createdAt).fromNow()}
        </Link>
        <p className="break-all text-xl">{content}</p>
      </Link>
    </li>
  )
}
