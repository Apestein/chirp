import Image from "next/image"
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { type PropsWithChildren, useEffect } from "react"
import dogeLogo from "@/public/doge-logo.png"
import { api } from "~/utils/api"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div id="root">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

function Header() {
  const ctx = api.useContext()
  const { isSignedIn } = useAuth()
  useEffect(() => {
    console.log(isSignedIn)
    void ctx.main.invalidate()
  }, [isSignedIn])
  return (
    <header className="border-b border-b-[#ffffff50]">
      <i className="relative flex p-1">
        <div className="absolute p-3 text-xl" role="signIn-signOut">
          {isSignedIn && (
            <SignOutButton>
              <button className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-rose-500 px-5 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-rose-600 focus:bg-rose-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-rose-300 disabled:bg-rose-300 disabled:shadow-none">
                Sign-Out
              </button>
            </SignOutButton>
          )}
          {!isSignedIn && (
            <SignInButton>
              <button className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-teal-500 px-5 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-teal-600 focus:bg-teal-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-teal-300 disabled:bg-teal-300 disabled:shadow-none">
                Sign-In
              </button>
            </SignInButton>
          )}
        </div>
        <Link href="/" className="m-auto">
          <Image
            src={dogeLogo}
            alt="doge-logo"
            placeholder="blur"
            className="w-16"
          />
        </Link>
      </i>
      <section className="grid grid-cols-2 justify-items-center">
        <label>
          <input
            type="radio"
            name="forYou-following"
            defaultChecked
            className="peer hidden"
          />
          For you
          <div className="mt-2 h-1 rounded-xl bg-transparent peer-checked:bg-blue-500"></div>
        </label>
        <label>
          <input type="radio" name="forYou-following" className="peer hidden" />
          Following
          <div className="mt-2 h-1 rounded-xl bg-transparent peer-checked:bg-blue-500"></div>
        </label>
      </section>
    </header>
  )
}

function Footer() {
  return (
    <footer className="flex justify-around border-t border-t-[#ffffff50] p-3">
      <Link href={"/"}>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="currentColor"
          className="h-7 w-7 text-neutral-200"
        >
          <g>
            <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"></path>
          </g>
        </svg>
      </Link>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        className="h-7 w-7 text-neutral-200"
      >
        <g>
          <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
        </g>
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        className="h-7 w-7 text-neutral-200"
      >
        <g>
          <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z"></path>
        </g>
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        className="h-7 w-7 text-neutral-200"
      >
        <g>
          <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path>
        </g>
      </svg>
    </footer>
  )
}
