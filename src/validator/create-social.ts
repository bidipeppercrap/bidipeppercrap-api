import { ValidationTargets } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { z } from "zod";

export const createSocialSchema = z.object({
    name: z.string(),
    targetUrl: z.string(),
    faClass: z.string()
});

export const createSocialValidator = (query: keyof ValidationTargets) => {
    const callback: ValidationFunction<Record<string, string | string[]>, any, any, string> = (value, c) => {
        const parsed = createSocialSchema.safeParse(value);
        if (!parsed.success) {
            return c.json(parsed.error, 400);
        }
        return parsed.data;
    };

    return validator(query, callback);
}