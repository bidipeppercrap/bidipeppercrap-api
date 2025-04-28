import { Hono } from "hono";
import { sign } from "hono/jwt";
import * as OTPAuth from "otpauth";
import { validator } from "hono/validator";
import { loginSchema } from "../schema/user";
import { DatabaseHelper } from "../db";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import { Bindings } from "../bindings";

const router = new Hono<{ Bindings: Bindings }>();

router.post(
    "/",
    validator("json", (value, c) => {
        const parsed = loginSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const { username, token } = c.req.valid("json");
        
        const db = DatabaseHelper.create(c.env);
        const result = await db.select({ uri: users.totp, id: users.id })
            .from(users)
            .where(eq(users.username, username));

        if (result.length < 1) return c.text("username not found", 401);
        const { uri, id } = result[0];

        const totp = OTPAuth.URI.parse(uri);
        const delta = totp.validate({ token, window: 1 });

        if (delta != null) {
            const payload = {
                id,
                username,
                exp: Math.floor(Date.now()) * 365
            }
            const jwt = await sign(payload, c.env.JWT_SECRET);

            return c.json({
                id,
                username,
                jwt
            });
        }

        return c.json('invalid token', 401);
    }
)

export default router;