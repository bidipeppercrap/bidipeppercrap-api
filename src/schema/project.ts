import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string(),
    targetUrl: z.string(),
    logoUrl: z.string()
});