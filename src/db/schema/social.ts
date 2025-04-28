import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

export const socials = sqliteTable('socials', {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    target_url: text(),
    fa_class: text()
});
