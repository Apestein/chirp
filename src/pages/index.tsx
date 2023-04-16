import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { toast } from "react-hot-toast"
import Post from "~/components/Post"
import Footer from "~/components/Footer"
import Header from "~/components/Header"
import { api } from "~/utils/api"
import type { InferGetStaticPropsType } from "next"
import { client } from "~/utils/contentful-client"
import crypto from "crypto"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const getStaticProps = async () => {
  const res = await client.getEntries({
    content_type: "trending",
  })
  const data = res.items.map((item) => item.fields.topic) as string[]
  return {
    props: {
      trends: data,
    },
  }
}

export default function Home({
  trends,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: posts, isLoading } = api.main.getAll.useQuery()
  return (
    <>
      <Header />
      <main className="flex max-h-full justify-center overflow-auto">
        <div className="container relative h-full border-x border-x-[#ffffff50] pt-3">
          <PostWizard />
          {isLoading ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-live="polite"
              aria-busy="true"
              aria-labelledby="title-08a desc-08a"
              className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
            >
              <title id="title-08a">Icon title</title>
              <desc id="desc-08a">Some desc</desc>
              <path
                d="M7 8H3V16H7V8Z"
                className="animate animate-bounce fill-sky-500 "
              />
              <path
                d="M14 8H10V16H14V8Z"
                className="animate animate-bounce fill-sky-500  [animation-delay:.2s]"
              />
              <path
                d="M21 8H17V16H21V8Z"
                className="animate animate-bounce fill-sky-500  [animation-delay:.4s]"
              />
            </svg>
          ) : (
            <ul>
              {posts?.map((post) => (
                <Post {...post} key={post.id} />
              ))}
            </ul>
          )}
        </div>
        <ul className="m-3 hidden sm:block">
          <h2 className="mb-3 text-xl">Trending</h2>
          {trends.map((trend, index) => (
            <li key={crypto.randomBytes(20).toString("hex")}>
              {++index}.&nbsp;{trend}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}

function PostWizard() {
  const { user } = useUser()
  const ctx = api.useContext()
  const { mutate, isLoading } = api.main.create.useMutation({
    onSuccess: () => {
      const postInput = document.querySelector(
        "#post-input"
      ) as HTMLInputElement
      postInput.value = ""
      void ctx.main.getAll.invalidate()
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
    mutate({ content: postInput.value })
  }

  return (
    <section className="flex items-center border-b border-b-[#ffffff50] px-3 disabled:bg-red-500">
      <Image
        src={user?.profileImageUrl ?? "/user.svg"}
        alt="profile-image"
        width={64}
        height={64}
        className="rounded-full "
      />
      <input
        type="text"
        id="post-input"
        className="h-12 w-full rounded-sm px-2 text-xl text-black outline-none"
        disabled={isLoading}
        onKeyDown={handleSubmitOnEnter}
        placeholder="Please sign-in to tweet"
      />
      <button
        className="inline-flex h-12 items-center justify-center gap-2 justify-self-center whitespace-nowrap rounded bg-sky-500 px-6 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-sky-600 focus:bg-sky-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-sky-300 disabled:bg-sky-300 disabled:shadow-none"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        Tweet
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
