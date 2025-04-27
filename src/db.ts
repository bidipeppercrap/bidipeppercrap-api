import { drizzle } from "drizzle-orm/d1";

export interface Env {
  DB: D1Database;
}

export class DatabaseHelper {
  static create = (env: Env) => drizzle(env.DB);
}