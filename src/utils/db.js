import { Database } from "bun:sqlite";

const db = new Database(process.env.DEV === 'true' ? ":memory:" : "./data.db");

export default db;