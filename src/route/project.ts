import { Hono } from "hono";
import { validator } from "hono/validator";
import { createProjectSchema } from "../schema/project";

const router = new Hono();

router.get("/", (c) => {
    return c.text("project")
});

router.post(
    "/",
    validator("json", (value, c) => {
        const parsed = createProjectSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid!", 401);
        }
        return parsed.data;
    }),
    (c) => {
        const data = c.req.valid("json");

        return c.json(data.name, 201);
    }
);

export default router;