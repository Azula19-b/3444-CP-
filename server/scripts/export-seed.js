import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = path.resolve(serverDirectory, "..");
const databasePath = path.join(repositoryDirectory, "database.db");
const outputPath = path.join(serverDirectory, "data", "seed-data.json");

function query(sql) {
  const result = execFileSync("sqlite3", ["-json", databasePath, sql], {
    encoding: "utf8",
  });
  return result.trim() ? JSON.parse(result) : [];
}

const seedData = {
  restaurants: query(
    "SELECT id, name, location, latitude, longitude FROM restaurants ORDER BY id"
  ),
  foods: query(
    `SELECT id, restaurant_id, name, category, price, rating, image
     FROM foods ORDER BY id`
  ),
};

fs.writeFileSync(outputPath, `${JSON.stringify(seedData, null, 2)}\n`);
console.log(
  `Exported ${seedData.restaurants.length} restaurants and ${seedData.foods.length} foods.`
);
