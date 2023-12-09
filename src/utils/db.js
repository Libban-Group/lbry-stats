import { Database } from "bun:sqlite";

// const db = new Database(process.env.DEV === 'true' ? ":memory:" : "./data.db");
const db = new Database("./data.db");

export default db;