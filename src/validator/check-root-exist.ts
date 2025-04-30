import { Context, MiddlewareHandler } from "hono";
import { Bindings } from "../bindings";
import { DatabaseHelper } from "../db";
import { count } from "drizzle-orm";
import { users } from "../db/schema/user";

export let isRootExist = false;

export const checkRootExist = async (_: Context<{ Bindings: Bindings }>, next: any) => {
    if (!isRootExist) {
        const count = await userCount(_);
        if (count > 0) isRootExist = true;
    }

    if (!isRootExist) next();
    else return _.text("root already exist", 400);
}

export async function userCount(c: Context<{ Bindings: Bindings }>) {
    const db = DatabaseHelper.create(c.env);
    const countResult = await db.select({ userCount: count() }).from(users);
    const { userCount } = countResult[0];

    return userCount;
}