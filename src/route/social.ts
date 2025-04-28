import { Hono } from "hono";
import { Bindings } from "../bindings";
import { jwtAuth } from "../middleware/auth";
import { DatabaseHelper } from "../db";
import { socials } from "../db/schema/social";
import { requestQueryValidator } from "../validator/request-query";
import { eq, like } from "drizzle-orm";
import { createSocialValidator } from "../validator/create-social";
import { checkSocialExistValidator } from "../validator/check-social-exist";

const router = new Hono<{ Bindings: Bindings }>();

router.get("/", requestQueryValidator("query"), async (c) => {
    const { q, limit, offset, unlimited } = c.req.valid("query");

    const db = DatabaseHelper.create(c.env);
    const term = q ? like(socials.name, `%${q}%`) : undefined;
    let query = db.select().from(socials)
        .where(term)
        .limit(unlimited ? undefined : limit)
        .offset(unlimited ? undefined : offset);

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

router.put("/:id", jwtAuth, checkSocialExistValidator("param"), createSocialValidator("json"), async (c) => {
    const { name, targetUrl, faClass } = c.req.valid("json");
    const social = c.req.valid("param");

    const db = DatabaseHelper.create(c.env);
    const result = await db.update(socials)
        .set({
            name,
            target_url: targetUrl,
            fa_class: faClass
        })
        .where(eq(socials.id, social.id))
        .returning();
    
    return c.json(result);
});

router.delete("/:id", jwtAuth, checkSocialExistValidator("param"), async (c) => {
    const { id } = c.req.valid("param");
    const db = DatabaseHelper.create(c.env);
    const result = await db.delete(socials).where(eq(socials.id, id)).returning();

    return c.json(result);
})

export default router;