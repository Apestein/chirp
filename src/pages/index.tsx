import PostWizard from "~/components/PostWizard"
import { api } from "~/utils/api"
import type { InferGetStaticPropsType } from "next"
import { client } from "~/utils/contentful-client"
import crypto from "crypto"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import InfiniteScroller from "~/components/infinite-scroller"

dayjs.extend(relativeTime)

export const getStaticProps = async () => {
  const res = await client.getEntries()
  const firstObj = res.items.shift()
  const topicOfTheDay = firstObj?.fields.topicoftheday as string
  const trends = res.items.map((item) => item.fields.topic) as string[]
  return {
    props: {
      trends,
      topicOfTheDay,
    },
    revalidate: 60,
  }
}

export default function Home({
  trends,
  topicOfTheDay,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const res = api.main.getAll.useInfiniteQuery(
    {
      limit: 25,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    res
  const posts = aggregatePosts()

  function aggregatePosts() {
    const pages = data?.pages
    const posts = pages?.reduce((prev, current) => {
      const combinedPosts = prev.posts.concat(current.posts)
      const shallowCopy = { ...prev }
      shallowCopy.posts = combinedPosts
      return shallowCopy
    }).posts
    return posts
  }

  return (
    <>
      <main id="infinite-scroll" className="flex justify-center overflow-auto">
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
            <InfiniteScroller
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage ?? true}
              isFetchingNextPage={isFetchingNextPage}
              posts={posts}
            />
          )}
        </div>
        <aside className="m-3 hidden sm:block">
          <div className="mb-3">
            <h2 className="mb-3 text-xl underline">Topic of The Day</h2>
            <p>{topicOfTheDay}</p>
          </div>
          <ul>
            <h2 className="mb-3 text-xl underline">Trending</h2>
            {trends.map((trend, index) => (
              <li key={crypto.randomBytes(20).toString("hex")}>
                {++index}.&nbsp;{trend}
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </>
  )
}
