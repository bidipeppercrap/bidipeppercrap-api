import { Hono } from "hono";
import { validator } from "hono/validator";
import { registerUserSchema } from "../schema/user";

const router = new Hono();

router.post(
    "/",
    validator("json", (value, c) => {
        const parsed = registerUserSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 401);
        }
        return parsed.data;
    })
    ,
    (c) => {
        return c.json({});
    }
)

export default router;
