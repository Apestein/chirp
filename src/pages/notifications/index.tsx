import Layout from "~/components/layout"
import { api } from "~/utils/api"
import Link from "next/link"

export default function NotificationsPage() {
  const { data } = api.main.getNotifications.useQuery()
  const notifications = data?.notifications

  return (
    <Layout>
      <main className="flex justify-center overflow-auto">
        <div className="container relative h-fit min-h-full border-x border-[#ffffff50]">
          <ul>
            {notifications?.map((notification) => (
              <li key={notification.id}>
                <Link
                  href={`/user/@${notification.from.username}?authorId=${notification.from.id}`}
                >
                  {notification.from.username}
                </Link>
                {notification.isComment ? " commented your " : " liked your "}
                <Link href={`/post/${notification.post.id}`}>post</Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </Layout>
  )
}
