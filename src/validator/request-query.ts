import { ValidationTargets } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { z } from "zod";

const schema = z.object({
    q: z.string().nullable(),
    limit: z.coerce.number().nullable(),
    offset: z.coerce.number().nullable(),
    unlimited: z.coerce.boolean().nullable()
});

export const requestQueryValidator = (query: keyof ValidationTargets) => {
    const callback: ValidationFunction<Record<string, string | string[]>, any, any, string> = (value, c) => {
        const queryParams = {
            q: value.q ?? "",
            limit: value.limit ?? 10,
            offset: value.offset ?? 0,
            unlimited: value.unlimited ?? false
        }
        const parsed = schema.safeParse(queryParams);
        if (!parsed.success) {
            return c.text("invalid query", 400);
        }

        return parsed.data;
    };

    return validator(query, callback);
}