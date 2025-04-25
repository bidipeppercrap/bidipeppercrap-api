import { Hono } from "hono";

import project from "./project";
import register from "./register";

const router = new Hono();

router.route("/project", project)
router.route("/register", register)

router.get('/', (c) => {
  return c.text('Hello Hono!')
});

export default router;
