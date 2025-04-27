import { Hono } from "hono";

import project from "./project";
import register from "./register";
import login from "./login";

const router = new Hono();

router.route("/login", login)
router.route("/project", project)
router.route("/register", register)

router.get('/', (c) => {
  return c.text('Welcome to bidipeppercrap API!')
});

export default router;
