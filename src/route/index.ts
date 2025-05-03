import { Hono } from "hono";

import project from "./project";
import social from "./social";
import register from "./register";
import login from "./login";
import upload from './upload';

const router = new Hono();

router.route("/login", login)
router.route("/project", project)
router.route("/social", social)
router.route("/register", register)
router.route("/upload", upload)

router.get('/', (c) => {
  return c.json({
    author: 'bidipeppercrap',
    email: "bidipeppercrap@proton.me",
    repository: "https://github.com/bidipeppercrap/bidipeppercrap-api"
  });
});

export default router;
