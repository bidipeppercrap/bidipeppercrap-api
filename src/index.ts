import { Hono } from 'hono';
import { cors } from 'hono/cors';
import router from "./route/index";

const app = new Hono();

app.use(cors());
app.route("/", router);

export default app;