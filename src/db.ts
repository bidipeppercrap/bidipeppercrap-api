import { drizzle } from "drizzle-orm/d1";
import { Bindings } from "./bindings";

export class DatabaseHelper {
  static create = (env: Bindings) => drizzle(env.DB);
}