import type { RouterOutputs } from "~/utils/api"
import Image from "next/image"
import Link from "next/link"
import { api } from "~/utils/api"
import { toast } from "react-hot-toast"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs["main"]["getAll"]["posts"][number]
export default function Post(props: PostWithUser) {
  const { id, authorId, createdAt, content, user, _count, likedBy } = props
  const ctx = api.useContext()
  const { mutate, isLoading } = api.main.updateLikes.useMutation({
    onSuccess: () => {
      void ctx.main.invalidate()
    },
    onError: (e) => {
      const otherErrorMessage = e.message
      if (otherErrorMessage) toast.error(otherErrorMessage)
      else toast.error("unknown error")
    },
  })

  function handleLikeUpdate() {
    if (isLoading) return
    mutate({ postId: id, isLiked: likedBy.length ? true : false })
  }
  return (
    <li className="flex items-center gap-3 border-b border-b-[#ffffff50] py-3 pl-3">
      <Image
        src={user.profileImageUrl}
        alt="profile-image"
        width={64}
        height={64}
        className="rounded-full"
      />
      <div className="w-full">
        <Link href={`/@${user.username}?authorId=${authorId}`}>
          {user.username} · {dayjs(createdAt).fromNow()}
        </Link>
        <div className="flex justify-between">
          <p className="break-all text-xl">{content}</p>
        </div>
      </div>
      <div className="pr-3">
        <div className="flex items-center justify-end">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill={likedBy.length ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-8 cursor-pointer rounded-full p-1 text-rose-600 ${
              likedBy.length ? "drop-shadow-[0_0_10px_red]" : ""
            } `}
            onClick={handleLikeUpdate}
          >
            <g>
              <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
            </g>
          </svg>
          <p>{_count.likedBy}</p>
        </div>
        <Link href={`/post/${id}`}>
          <p className="text-sm text-neutral-400">
            {_count.comments}&nbsp;comments
          </p>
        </Link>
      </div>
    </li>
  )
}
