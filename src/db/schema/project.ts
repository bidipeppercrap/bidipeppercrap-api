import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable('projects', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    target_url: text(),
    logo_url: text()
});
