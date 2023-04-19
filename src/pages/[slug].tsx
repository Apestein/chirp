import { type NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import Image from "next/image"
import { api } from "~/utils/api"
import Post from "~/components/Post"

const ProfilePage: NextPage = () => {
  const router = useRouter()
  const { slug, authorId } = router.query
  if (typeof authorId !== "string") return <p>No authorId error</p>
  if (typeof slug !== "string") return <p>No slug error</p>
  const { data: postsByUser, isLoading } = api.main.getAllByUser.useQuery({
    authorId,
  })
  const user = postsByUser?.[0]?.user
  return (
    <>
      <Head>
        <title>{slug.substring(1)} Profile</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center overflow-auto">
        <div className="container flex flex-col border-x border-x-[#ffffff50]">
          <figure className="bg-blue-300">
            <Image
              src={user?.profileImageUrl ?? "/user.svg"}
              alt="profile-image"
              width={96}
              height={96}
              className="relative left-4 top-[48px] rounded-full border-4 border-black"
            />
          </figure>
          <h1 className="mt-12 w-full border-b border-b-[#ffffff50] pb-3 pl-3 text-xl font-bold">
            @{user?.username}
          </h1>
          <div className="relative grow">
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
                {postsByUser?.map((post) => (
                  <Post key={post.id} {...post} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
export default ProfilePage
