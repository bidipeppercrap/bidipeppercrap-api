import { Hono } from "hono";
import { Bindings } from "../bindings";
import { jwtAuth } from "../middleware/auth";
import { DatabaseHelper } from "../db";
import { socials } from "../db/schema/social";
import { requestQueryValidator } from "../validator/request-query";
import { eq, ilike } from "drizzle-orm";
import { createSocialValidator } from "../validator/create-social";
import { z } from "zod";

const router = new Hono<{ Bindings: Bindings }>();

router.get("/", requestQueryValidator("query"), async (c) => {
    const { q, limit, offset, unlimited } = c.req.valid("query");

    const db = DatabaseHelper.create(c.env);
    const term = q ? ilike(socials.name, `%${q}%`) : undefined;
    let query = db.select().from(socials)
        .where(term)
        .limit(unlimited ? 0 : limit)
        .offset(unlimited ? 0 : offset);

    const result = await query;

    return c.json(result);
});

router.post(
    "/",
    jwtAuth,
    createSocialValidator("json"),
    async (c) => {
        const data = c.req.valid("json");

        const db = DatabaseHelper.create(c.env);
        const created = await db.insert(socials).values({
            name: data.name,
            target_url: data.targetUrl,
            fa_class: data.faClass
        }).returning();

        return c.json(created, 201);
    }
);

router.put("/:id", jwtAuth, createSocialValidator("json"), async (c) => {
    const id = z.number().safeParse(c.req.param("id"));
    if (id.error) return c.text("invalid id", 400);

    const db = DatabaseHelper.create(c.env);
    const query = await db.select().from(socials).where(eq(socials.id, id.data!));
    if (query.length < 1) return c.text("social not found", 400);

    const { name, targetUrl, faClass } = c.req.valid("json");
    const social = query[0];
    const result = await db.update(socials)
        .set({
            name,
            target_url: targetUrl,
            fa_class: faClass
        })
        .where(eq(socials.id, social.id))
        .returning();
    
    return c.json(result);
})

export default router;