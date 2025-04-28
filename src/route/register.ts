import { Context, Hono } from "hono";
import * as OTPAuth from "otpauth";
import { validator } from "hono/validator";
import { registerSchema, totpGenerateSchema } from "../schema/user";
import { DatabaseHelper } from "../db";
import { users } from "../db/schema/user";
import { Bindings } from "../bindings";
import { count } from "drizzle-orm";
import { jwtAuth } from "../middleware/auth";

const router = new Hono<{ Bindings: Bindings }>();

router.post(
    "/generate-totp",
    jwtAuth,
    validator("json", (value, c) => {
        const parsed = totpGenerateSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid data", 400);
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
);

async function createUser(c: Context, username: string, uri: string) {
    try {
        OTPAuth.URI.parse(uri);
    } catch(error) {
        return c.text("TOTP invalid", 400);
    }

    const user = {
        username,
        totp: uri
    }

    const db = DatabaseHelper.create(c.env);
    const result = await db.insert(users).values(user);

    return result;
}

router.post(
    "/root",
    validator("json", (value, c) => {
        const parsed = registerSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const { username, uri } = c.req.valid("json");
        const db = DatabaseHelper.create(c.env);
        const countResult = await db.select({ userCount: count() }).from(users);
        const { userCount } = countResult[0];

        if (userCount > 0) return c.json('root already exists', 401);
        
        const result = await createUser(c, username, uri);

        return c.json(result);
    }
)

router.post(
    "/",
    jwtAuth,
    validator("json", (value, c) => {
        const parsed = registerSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 401);
        }
        return parsed.data;
    }),
    async (c) => {
        const { username, uri } = c.req.valid("json");
        const result = await createUser(c, username, uri);

        return c.json(result);
    }
)

export default router;
