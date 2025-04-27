import { Hono } from "hono";
import * as OTPAuth from "otpauth";
import { validator } from "hono/validator";
import { registerSchema, totpGenerateSchema } from "../schema/user";
import { DatabaseHelper, Env } from "../db";
import { users } from "../db/schema/user";

const router = new Hono<{ Bindings: Env }>();

router.post(
    "/generate-totp",
    validator("json", (value, c) => {
        const parsed = totpGenerateSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid data", 401);
        }
        return parsed.data;
    }),
    (c) => {
        const data = c.req.valid("json");

        let totp = new OTPAuth.TOTP({
            issuer: "bidipeppercrap",
            label: data.username,
        });

        let uri = totp.toString();

        return c.json({
            uri
        });
    }
)

router.post(
    "/",
    validator("json", (value, c) => {
        const parsed = registerSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 401);
        }
        return parsed.data;
    }),
    async (c) => {
        const { username, uri } = c.req.valid("json");
        try {
            OTPAuth.URI.parse(uri);
        } catch(error) {
            return c.text("TOTP invalid", 401);
        }
        const db = DatabaseHelper.create(c.env);
        const user = {
            username,
            totp: uri
        }
        
        const result = await db.insert(users).values(user);

        return c.json(result);
    }
)

export default router;
