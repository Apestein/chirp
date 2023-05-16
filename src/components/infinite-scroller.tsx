import { useEffect, useRef } from "react"
import type { RouterOutputs } from "~/utils/api"
import type {
  InfiniteQueryObserverResult,
  FetchNextPageOptions,
} from "@tanstack/react-query"
import { useAutoAnimate } from "@formkit/auto-animate/react"

import Post from "~/components/Post"

type Posts = RouterOutputs["main"]["getAll"]["posts"]
export default function InfiniteScroller(props: {
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult>
  posts?: Posts
  isFetchingNextPage: boolean
  hasNextPage: boolean
}) {
  const { fetchNextPage, posts, isFetchingNextPage, hasNextPage } = props
  const observerTarget = useRef(null)

  const [parent, enableAnimations] = useAutoAnimate()

  useEffect(() => {
    if (isFetchingNextPage) enableAnimations(false)
    else setTimeout(() => enableAnimations(true), 2000)
  }, [isFetchingNextPage, enableAnimations])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { threshold: 1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [observerTarget, fetchNextPage])

  return (
    <div>
      <ul ref={parent}>
        {posts?.map((post) => (
          <Post {...post} key={post.id} />
        ))}
      </ul>
      {hasNextPage && <p className="p-3">Loading...</p>}
      {!hasNextPage && <p className="p-3">The beginning of time...</p>}
      <div ref={observerTarget}></div>
    </div>
  )
}
