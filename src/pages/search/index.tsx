import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import Layout from "~/components/layout"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const debounced = useDebouncedCallback((value: string) => {
    setQuery(value)
  }, 1500)
  const router = useRouter()
  useEffect(() => {
    if (query.length >= 3)
      void router.push("search/" + query, undefined, {
        scroll: false,
        shallow: true,
      })
  }, [query])

  return (
    <Layout>
      <main className="flex justify-center overflow-auto">
        <div className="container relative h-fit min-h-full border-x border-[#ffffff50]">
          <div className="p-3">
            <input
              type="text"
              className="h-12 w-full rounded-sm px-2 text-xl text-black outline-none"
              placeholder="Search posts"
              onChange={(e) => debounced(e.target.value)}
            />
          </div>
        </div>
      </main>
    </Layout>
  )
}
