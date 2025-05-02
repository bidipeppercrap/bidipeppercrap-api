import { z } from "zod";

export const totpGenerateSchema = z.object({
    username: z.string()
});

export const registerSchema = z.object({
    username: z.string(),
    uri: z.string(),
    token: z.string()
});

export const loginSchema = z.object({
    username: z.string(),
    token: z.string()
});