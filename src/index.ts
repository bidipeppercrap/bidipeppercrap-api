import { Hono } from 'hono'
import router from "./route/index";

const app = new Hono()

app.route("/", router);

export default app
