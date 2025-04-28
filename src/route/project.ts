import { Hono } from "hono";
import { Bindings } from "../bindings";
import { jwtAuth } from "../middleware/auth";
import { DatabaseHelper } from "../db";
import { projects } from "../db/schema/project";
import { requestQueryValidator } from "../validator/request-query";
import { eq, like } from "drizzle-orm";
import { createProjectValidator } from "../validator/create-project";

const router = new Hono<{ Bindings: Bindings }>();

router.get("/", requestQueryValidator("query"), async (c) => {
    const { q, limit, offset, unlimited } = c.req.valid("query");

    const db = DatabaseHelper.create(c.env);
    const term = q ? like(projects.name, `%${q}%`) : undefined;
    let query = db.select().from(projects)
        .where(term)
        .limit(unlimited ? undefined : limit)
        .offset(unlimited ? undefined : offset);

    const result = await query;

    return c.json(result);
});

router.post(
    "/",
    jwtAuth,
    createProjectValidator("json"),
    async (c) => {
        const data = c.req.valid("json");

        const db = DatabaseHelper.create(c.env);
        const created = await db.insert(projects).values({
            name: data.name,
            target_url: data.targetUrl,
            logo_url: data.logoUrl
        }).returning();

        return c.json(created, 201);
    }
);

router.put("/:id", jwtAuth, createProjectValidator("json"), async (c) => {
    try {
        parseInt(c.req.param("id"));
    } catch (error) {
        return c.text('invalid id', 400);
    }
    const id = parseInt(c.req.param("id"));

    const db = DatabaseHelper.create(c.env);
    const query = await db.select().from(projects).where(eq(projects.id, id));
    if (query.length < 1) return c.text("project not found", 400);

    const { name, targetUrl, logoUrl } = c.req.valid("json");
    const project = query[0];
    const result = await db.update(projects)
        .set({
            name,
            target_url: targetUrl,
            logo_url: logoUrl
        })
        .where(eq(projects.id, project.id))
        .returning();
    
    return c.json(result);
})

export default router;