import type { RouterOutputs } from "~/utils/api"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["main"]["getAll"][number]
export default function Post(props: PostWithUser) {
  const { post, author } = props
  return (
    <li className="flex items-center gap-3 border-b border-b-[#ffffff50] py-3 pl-3">
      <Image
        src={author?.image}
        alt="profile-image"
        width={64}
        height={64}
        className="w-16 rounded-full"
      />
      <Link href={`post/${post.id}`}>
        <Link href={`@${author.username}?authorId=${post.authorId}`}>
          {author.username} · {dayjs(post.createdAt).fromNow()}
        </Link>
        <p className="text-xl">{post.content}</p>
      </Link>
    </li>
  )
}
