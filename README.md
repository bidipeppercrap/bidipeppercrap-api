# bidipeppercrap.com API

## Setup

1. `npm i`
1. Create D1 database `bidipeppercrap-com` and fill in the `.dev.vars`
1. `npx wrangler d1 migrations apply <database_name> (--local/--remote)`
1. Create R2 bucket `bidipeppercrap-com`

## To generate migration

`npx drizzle-kit generate`

## Worker

1. `npm run deploy`

## Credit

Made with Hono, Drizzle, Cloudflare D1

Secured with OTPAuth

Hosted on Cloudflare Worker 🔥