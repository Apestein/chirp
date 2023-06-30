import { type NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { api } from "~/utils/api"
import Post from "~/components/Post"
import PostWizard from "~/components/PostWizard"
import Layout from "~/components/layout"

const SinglePostPage: NextPage = () => {
  const router = useRouter()
  let id = ""
  if (typeof router.query.id === "string") id = router.query.id
  const { data: post, isLoading } = api.main.getPostById.useQuery(
    {
      postId: id,
    },
    { enabled: Boolean(id) }
  )
  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <main className="flex justify-center overflow-auto">
          <div className="container relative h-fit min-h-full border-x border-x-[#ffffff50]">
            {isLoading || !post ? (
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
              <Post {...post} />
            )}
            <PostWizard originPostId={id} />
            <ul>
              {post?.comments.map((post) => (
                <Post key={post.id} {...post} />
              ))}
            </ul>
          </div>
        </main>
      </Layout>
    </>
  )
}
export default SinglePostPage
