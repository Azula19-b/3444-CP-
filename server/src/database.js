import fs from "node:fs/promises";
import sqlite3 from "sqlite3";

export function openDatabase(databasePath) {
  return new sqlite3.Database(databasePath);
}

export function run(db, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, parameters, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function all(db, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, parameters, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

export function get(db, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, parameters, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

export function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => (error ? reject(error) : resolve()));
  });
}

export function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => (error ? reject(error) : resolve()));
  });
}

async function loadSeedData(seedPath) {
  const contents = await fs.readFile(seedPath, "utf8");
  return JSON.parse(contents);
}

export async function initializeDatabase(db, { seedPath, seed = true } = {}) {
  await exec(
    db,
    `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        latitude REAL,
        longitude REAL,
        UNIQUE(name, location)
      );

      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        price REAL CHECK (price IS NULL OR price >= 0),
        rating REAL CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
        image TEXT,
        UNIQUE(name, restaurant_id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      );
    `
  );

  const row = await get(db, "SELECT COUNT(*) AS count FROM restaurants");
  if (!seed || row.count > 0) {
    return;
  }

  if (!seedPath) {
    throw new Error("A seed path is required when initializing an empty database.");
  }

  const seedData = await loadSeedData(seedPath);
  await exec(db, "BEGIN IMMEDIATE TRANSACTION");

  try {
    for (const restaurant of seedData.restaurants) {
      await run(
        db,
        `INSERT INTO restaurants (id, name, location, latitude, longitude)
         VALUES (?, ?, ?, ?, ?)`,
        [
          restaurant.id,
          restaurant.name,
          restaurant.location,
          restaurant.latitude,
          restaurant.longitude,
        ]
      );
    }

    for (const food of seedData.foods) {
      await run(
        db,
        `INSERT INTO foods
          (id, restaurant_id, name, category, price, rating, image)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          food.id,
          food.restaurant_id,
          food.name,
          food.category,
          food.price,
          food.rating,
          food.image,
        ]
      );
    }

    await exec(db, "COMMIT");
  } catch (error) {
    await exec(db, "ROLLBACK");
    throw error;
  }
}
