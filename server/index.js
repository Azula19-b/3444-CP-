import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./src/app.js";
import {
  closeDatabase,
  initializeDatabase,
  openDatabase,
} from "./src/database.js";
import { FoodRepository } from "./src/food-repository.js";
import { JsonUserStore } from "./src/user-store.js";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const resolveFromServer = (value) => path.resolve(serverDirectory, value);

const port = Number(process.env.PORT || 5001);
const databasePath = resolveFromServer(process.env.DATABASE_PATH || "../database.db");
const usersPath = resolveFromServer(process.env.USERS_PATH || "./data/users.json");
const seedPath = path.join(serverDirectory, "data", "seed-data.json");
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const database = openDatabase(databasePath);
await initializeDatabase(database, { seedPath });

const app = createApp({
  foodRepository: new FoodRepository(database),
  userStore: new JsonUserStore(usersPath),
  clientOrigin,
});

const server = app.listen(port, () => {
  console.log(`QuickBytes API listening on http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  server.close(async () => {
    await closeDatabase(database);
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
