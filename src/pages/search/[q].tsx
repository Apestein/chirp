import { useRouter } from "next/router"
import Layout from "~/components/layout"
import { api } from "~/utils/api"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import Post from "~/components/Post"

export default function SearchPage() {
  function stringOrNull(str: unknown) {
    if (typeof str === "string") {
      return str
    }
    return ""
  }

  const router = useRouter()
  const q = stringOrNull(router.query.q)?.trim()
  const res = api.main.search.useQuery(
    { query: q },
    {
      enabled: Boolean(q),
    }
  )
  const Posts = res.data

  const [query, setQuery] = useState(q)
  const debounced = useDebouncedCallback((value: string) => {
    setQuery(value)
  }, 1000)
  useEffect(() => {
    if (router.isReady && query.length >= 3)
      void router.push(query, undefined, {
        scroll: false,
        shallow: true,
      })
  }, [query])

  return (
    <Layout>
      <main className="flex justify-center overflow-auto">
        <div className="container relative h-fit min-h-full border-x border-[#ffffff50]">
          <input
            type="text"
            className="h-12 w-full rounded-sm px-2 text-xl text-black outline-none"
            placeholder="Search posts"
            defaultValue={q}
            onChange={(e) => debounced(e.target.value)}
          />
          <ul>
            {Posts?.map((post) => (
              <Post key={post.id} {...post} />
            ))}
          </ul>
        </div>
      </main>
    </Layout>
  )
}
