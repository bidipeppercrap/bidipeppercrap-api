import { z } from "zod";

export const registerUserSchema = z.object({
    username: z.string()
});

export const loginSchema = z.object({
    username: z.string(),
    otp: z.number()
});