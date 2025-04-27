import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { Bindings } from "../bindings";

export const jwtAuth = (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET
    });

    return jwtMiddleware(c, next);
}