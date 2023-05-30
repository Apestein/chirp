import { env } from "~/env.mjs"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const contentful = require("contentful")

export const client = contentful.createClient({
  space: env.CONTENTFUL_SPACE_ID,
  accessToken: env.CONTENTFUL_ACCESS_TOKEN,
})
