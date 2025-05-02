import { Context, Hono } from "hono";
import * as OTPAuth from "otpauth";
import { validator } from "hono/validator";
import { registerSchema, totpGenerateSchema } from "../schema/user";
import { DatabaseHelper } from "../db";
import { users } from "../db/schema/user";
import { Bindings } from "../bindings";
import { jwtAuth } from "../middleware/auth";
import { checkRootExist } from "../validator/check-root-exist";
import { sign } from "hono/jwt";

const router = new Hono<{ Bindings: Bindings }>();

router.get('check-root-exist', checkRootExist, (c) => {
    return c.json({
        isRootExist: false
    });
});

router.post(
    "/generate-totp",
    checkRootExist,
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

async function createUser(c: Context, username: string, uri: string, token: string) {
    let totp;

    try {
        totp = OTPAuth.URI.parse(uri);
    } catch(error) {
        return {
            error: true,
            message: "Invalid URI"
        }
    }

    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
        return {
            error: true,
            message: "Invalid Token"
        }
    }

    const user = {
        username,
        totp: uri
    }

    const db = DatabaseHelper.create(c.env);
    const created = await db.insert(users).values(user).returning();
    const { id } = created[0];

    const payload = {
        id,
        username,
        exp: Math.floor(Date.now()) * 365
    }
    const jwt = await sign(payload, c.env.JWT_SECRET);

    return {
        id,
        username,
        jwt
    };
}

router.post(
    "/root",
    checkRootExist,
    validator("json", (value, c) => {
        const parsed = registerSchema.safeParse(value);
        if (!parsed.success) {
            return c.text("Invalid", 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const { username, uri, token } = c.req.valid("json");
        const result = await createUser(c, username, uri, token);

        if (result.error) {
            return c.json(result, 400);
        }

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
        const { username, uri, token } = c.req.valid("json");
        const result = await createUser(c, username, uri, token);

        if (result.error) {
            return c.json(result, 400);
        }

        return c.json(result);
    }
)

export default router;
