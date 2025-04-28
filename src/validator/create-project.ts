import { ValidationTargets } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { createProjectSchema } from "../schema/project";

export const createProjectValidator = (query: keyof ValidationTargets) => {
    const callback: ValidationFunction<Record<string, string | string[]>, any, any, string> = (value, c) => {
        const parsed = createProjectSchema.safeParse(value);
        if (!parsed.success) {
            return c.json(parsed.error, 400);
        }
        return parsed.data;
    };

    return validator(query, callback);
}