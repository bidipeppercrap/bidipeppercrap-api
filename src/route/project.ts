import { Hono } from "hono";
import { Bindings } from "../bindings";
import { jwtAuth } from "../middleware/auth";
import { DatabaseHelper } from "../db";
import { projects } from "../db/schema/project";
import { requestQueryValidator } from "../validator/request-query";
import { eq, like } from "drizzle-orm";
import { createProjectValidator } from "../validator/create-project";
import { checkProjectExistValidator } from "../validator/check-project-exist";

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

router.put("/:id", jwtAuth, checkProjectExistValidator("param"), createProjectValidator("json"), async (c) => {
    const { name, targetUrl, logoUrl } = c.req.valid("json");
    const project = c.req.valid("param");

    const db = DatabaseHelper.create(c.env);
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

router.delete("/:id", jwtAuth, checkProjectExistValidator("param"), async (c) => {
    const { id } = c.req.valid("param");
    const db = DatabaseHelper.create(c.env);
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();

    return c.json(result);
})

export default router;