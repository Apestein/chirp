import Layout from "~/components/layout"
import { api } from "~/utils/api"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export default function NotificationsPage() {
  const { data } = api.main.getNotifications.useQuery()
  const notifications = data?.notifications

  return (
    <Layout>
      <main className="flex justify-center overflow-auto">
        <div className="container relative h-fit min-h-full border-x border-[#ffffff50]">
          <ul>
            {notifications?.map((notification) => (
              <li
                key={crypto.randomUUID()}
                className="flex items-center justify-between border-b border-b-[#ffffff50] p-3 text-xl"
              >
                <div>
                  <Link
                    href={`/user/@${notification.from.username}?authorId=${notification.from.id}`}
                    className="text-blue-500"
                  >
                    {notification.from.username}
                  </Link>
                  {notification.action === "liked"
                    ? " liked your "
                    : " commented your "}
                  <Link
                    href={`/post/${notification.post.id}`}
                    className="text-blue-500"
                  >
                    post
                  </Link>
                </div>
                <div>{dayjs(notification.createdAt).fromNow()}</div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </Layout>
  )
}
