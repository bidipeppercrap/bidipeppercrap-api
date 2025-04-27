import { Hono } from "hono";
import * as OTPAuth from "otpauth";
import { validator } from "hono/validator";
import { loginSchema } from "../schema/user";
import { DatabaseHelper, Env } from "../db";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";

const router = new Hono<{ Bindings: Env }>();

router.post(
    "/",
    validator("json", (value, c) => {
        const parsed = loginSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 401);
        }
        return parsed.data;
    }),
    async (c) => {
        const { username, token } = c.req.valid("json");
        
        const db = DatabaseHelper.create(c.env);
        const result = await db.select({ uri: users.totp })
            .from(users)
            .where(eq(users.username, username));

        if (result.length < 1) return c.text("username not found", 401);
        const { uri } = result[0];

        const totp = OTPAuth.URI.parse(uri);

        let delta = totp.validate({ token, window: 1 });

        return c.json(delta);
    }
)

export default router;