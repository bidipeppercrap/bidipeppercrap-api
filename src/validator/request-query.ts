import { ValidationTargets } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { z } from "zod";

const schema = z.object({
    q: z.string().nullable(),
    limit: z.number().nullable(),
    offset: z.number().nullable(),
    unlimited: z.boolean().nullable()
});

export const requestQueryValidator = (query: keyof ValidationTargets) => {
    const callback: ValidationFunction<Record<string, string | string[]>, any, any, string> = (value, c) => {
        const parsed = schema.safeParse(value);
        if (!parsed.success) {
            return c.text("invalid query", 400);
        }

        if (!parsed.data.limit) parsed.data.limit = 10;
        if (!parsed.data.offset) parsed.data.offset = 0;

        return parsed.data;
    };

    return validator(query, callback);
}