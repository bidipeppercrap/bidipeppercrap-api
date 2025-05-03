import { ValidationTargets } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { z } from "zod";

const fileUploadSchema = z.object({
    file: z.instanceof(File),
});

export const fileUploadValidator = (query: keyof ValidationTargets) => {
    const callback: ValidationFunction<Record<string, string | string[]>, any, any, string> = async (value, c) => {
        const body = await c.req.parseBody();
        const parsed = fileUploadSchema.safeParse(body);
        if (!parsed.success) {
            return c.json(parsed.error, 400);
        }
        return parsed.data;
    };

    return validator(query, callback);
}