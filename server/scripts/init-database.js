import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  closeDatabase,
  initializeDatabase,
  openDatabase,
} from "../src/database.js";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.resolve(
  serverDirectory,
  process.env.DATABASE_PATH || "../database.db"
);
const seedPath = path.join(serverDirectory, "data", "seed-data.json");
const database = openDatabase(databasePath);

try {
  await initializeDatabase(database, { seedPath });
  console.log(`Database ready at ${databasePath}`);
} finally {
  await closeDatabase(database);
}
