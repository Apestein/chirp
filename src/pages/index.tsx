import Post from "~/components/Post"
import PostWizard from "~/components/PostWizard"
import { api } from "~/utils/api"
import type { InferGetStaticPropsType } from "next"
import { client } from "~/utils/contentful-client"
import crypto from "crypto"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import InfiniteScroll from "react-infinite-scroll-component"

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
    revalidate: 60,
  }
}

export default function Home({
  trends,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: posts, isLoading, isError } = api.main.getAll.useQuery()
  if (isError) return <p>No posts error</p>
  return (
    <>
      <main className="flex justify-center overflow-auto">
        <div className="container relative h-fit min-h-full border-x border-[#ffffff50]">
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
    </>
  )
}
