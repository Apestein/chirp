import { type NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import Image from "next/image"
import { api } from "~/utils/api"
import Post from "~/components/Post"
import { toast } from "react-hot-toast"
import Layout from "~/components/layout"

const ProfilePage: NextPage = () => {
  const router = useRouter()
  const { slug, authorId } = router.query
  if (typeof authorId !== "string") return <p>No authorId error</p>
  if (typeof slug !== "string") return <p>No slug error</p>
  const { data: postsByUser, isLoading } = api.main.getAllByUser.useQuery({
    authorId,
  })

  const ctx = api.useContext()
  const { mutate, isLoading: isMutatingFollowStatus } =
    api.main.updateFollowers.useMutation({
      onSuccess: () => {
        void ctx.main.getAllByUser.invalidate()
      },
      onError: (e) => {
        const otherErrorMessage = e.message
        if (otherErrorMessage) toast.error(otherErrorMessage)
        else toast.error("unknown error")
      },
    })

  const user = postsByUser?.[0]?.user
  function toggleFollow() {
    if (isMutatingFollowStatus) return
    if (!user?.id) {
      toast.error("Failed to follow")
      return
    }
    mutate({ userToFollowId: user.id, isFollowed: user.followers.length !== 0 })
  }

  return (
    <>
      <Head>
        <title>{slug.substring(1)} Profile</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
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
            <div className="flex items-center justify-between border-b border-b-[#ffffff50] pr-3 ">
              <div className="mt-12 flex w-full items-end gap-3 pb-3 pl-3">
                <h2 className="text-xl font-bold">@{user?.username}</h2>
                <h2 className="text-sm text-slate-300">
                  Followers {user?._count.followers}
                </h2>
                <h2 className="text-sm text-slate-300">
                  Follows {user?._count.follows}
                </h2>
              </div>
              {user?.followers.length ? (
                <button
                  onClick={toggleFollow}
                  disabled={!user}
                  className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-rose-500 px-5 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-rose-600 focus:bg-rose-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-rose-300 disabled:bg-rose-300 disabled:shadow-none"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={toggleFollow}
                  disabled={!user}
                  className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-cyan-500 px-6 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-cyan-600 focus:bg-cyan-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-cyan-300 disabled:bg-cyan-300 disabled:shadow-none"
                >
                  Follow
                </button>
              )}
            </div>
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
      </Layout>
    </>
  )
}
export default ProfilePage