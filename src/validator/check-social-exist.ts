import { Context, ValidationTargets } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { DatabaseHelper } from "../db";
import { Bindings } from "../bindings";
import { eq } from "drizzle-orm";
import { socials } from "../db/schema/social";

export const checkSocialExistValidator = (query: keyof ValidationTargets) => {
    const callback: ValidationFunction<Record<string, string | string[]>, any, any, string> = async (value, c: Context<{ Bindings: Bindings }>) => {
        try {
            parseInt(c.req.param("id"));
        } catch (error) {
            return c.text('invalid id', 400);
        }
        const id = parseInt(c.req.param("id"));
    
        const db = DatabaseHelper.create(c.env);
        const query = await db.select().from(socials).where(eq(socials.id, id));
        if (query.length < 1) return c.text("social not found", 400);

        return query[0];
    };

    return validator(query, callback);
}