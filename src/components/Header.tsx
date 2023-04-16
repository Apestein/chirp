import Image from "next/image"
import { SignInButton, SignOutButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"

export default function Header() {
  const { isSignedIn } = useUser()
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
        <Image
          src="/doge-logo.png"
          alt="doge-logo"
          width={64}
          height={64}
          className="m-auto rounded-full"
        />
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
