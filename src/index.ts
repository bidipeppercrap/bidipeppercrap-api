import { Hono } from 'hono'
import router from "./route/index";
import type { Env } from './db';

const app = new Hono()

app.route("/", router);

export default app
