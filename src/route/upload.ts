import { Hono } from "hono";
import { jwtAuth } from "../middleware/auth";
import { fileUploadValidator } from "../validator/file-upload";
import { Bindings } from "../bindings";

const router = new Hono<{ Bindings: Bindings }>();

router.post(
    "/",
    jwtAuth,
    fileUploadValidator('form'),
    async (c) => {
        const data = c.req.valid("form");
        const file: File = data.file;
        const uuid = crypto.randomUUID();
        const r2Object = await c.env.R2_BIDIPEPPERCRAP_COM.put(uuid, file, {
            httpMetadata: {
                contentType: file.type
            }
        });

        if (!r2Object) return c.json({ success: false, message: r2Object }, 400);

        return c.json({ success: true, key: r2Object.key }, 201);
    }
);

router.get("/:key", async (c) => {
    const key = c.req.param("key");
    const file = await c.env.R2_BIDIPEPPERCRAP_COM.get(key);

    if (file === null) return c.json({ success: false, message: "not found" }, 404);

    const headers = new Headers();
    file.writeHttpMetadata(headers);
    headers.set("etag", file.httpEtag);
    headers.forEach((value, key) => {
        c.header(key, value);
    });
    
    return c.newResponse(file.body, 200);
})

export default router;