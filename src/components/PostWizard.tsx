import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { toast } from "react-hot-toast"
import { api } from "~/utils/api"

export default function PostWizard({
  originPostId,
}: {
  originPostId?: string
}) {
  const tweetOrReply = originPostId ? "Reply" : "Tweet"
  const { user, isSignedIn } = useUser()
  const ctx = api.useContext()
  const { mutate, isLoading } = api.main.create.useMutation({
    onSuccess: () => {
      const postInput = document.querySelector(
        "#post-input"
      ) as HTMLInputElement
      postInput.value = ""
      void ctx.main.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content?.[0]
      const otherErrorMessage = e.message
      if (errorMessage) toast.error(errorMessage)
      else if (otherErrorMessage) toast.error(otherErrorMessage)
      else toast.error("unknown error")
    },
  })

  function handleSubmitOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    mutate({ content: e.currentTarget.value })
  }

  function handleSubmit() {
    const postInput = document.querySelector("#post-input") as HTMLInputElement
    mutate({ content: postInput.value, originPostId })
  }

  return (
    <section className="flex items-center border-b border-b-[#ffffff50] p-3 px-3">
      <Image
        src={user?.profileImageUrl ?? "/user.svg"}
        alt="profile-image"
        width={64}
        height={64}
        className="mr-3 rounded-full"
      />
      <input
        type="text"
        id="post-input"
        className="h-12 w-full rounded-sm px-2 text-xl text-black outline-none"
        disabled={!isSignedIn || isLoading}
        onKeyDown={handleSubmitOnEnter}
        placeholder={isSignedIn ? "Emojis only" : "Please sign-in to tweet"}
      />
      <button
        className="ml-1 inline-flex h-12 items-center justify-center gap-2 justify-self-center whitespace-nowrap rounded bg-sky-500 px-6 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-sky-600 focus:bg-sky-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-sky-300 disabled:bg-sky-300 disabled:shadow-none"
        onClick={handleSubmit}
        disabled={!isSignedIn || isLoading}
      >
        {tweetOrReply}
        {isLoading && (
          <svg
            className="h-8 w-8 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="graphics-symbol"
            aria-labelledby="title-05 desc-05"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
      </button>
    </section>
  )
}
