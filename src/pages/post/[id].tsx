import { type NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { api } from "~/utils/api"
import Post from "~/components/Post"
import Header from "~/components/Header"
import Footer from "~/components/Footer"

const SinglePostPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  if (typeof id !== "string") return <div>No id error</div>
  const { data, isLoading } = api.main.getPostById.useQuery({
    postId: id,
  })
  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <main className="flex max-h-full flex-col items-center justify-start overflow-auto">
        <div className="container relative h-full border-x border-x-[#ffffff50] pt-3">
          {isLoading || !data ? (
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
            <Post {...data} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
export default SinglePostPage
