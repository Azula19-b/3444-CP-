import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "data", "users.json");
const databasePath = path.join(__dirname, "..", "database.db");

const db = new sqlite3.Database(databasePath);

app.use(cors());
app.use(express.json());

function ensureUsersFile() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]", "utf-8");
  }
}

function readUsers() {
  ensureUsersFile();

  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      UNIQUE(name, location)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      price REAL,
      rating REAL,
      image TEXT,
      UNIQUE(name, restaurant_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
  `);
});

app.get("/", (req, res) => {
  res.send("QuickBytes backend is running.");
});

app.post("/api/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const users = readUsers();
  const existingUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ message: "This email is already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  return res.status(201).json({
    message: "Signup successful.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();
  const foundUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (!foundUser) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.status(200).json({
    message: "Login successful.",
    user: {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
    },
  });
});

app.get("/api/foods", (req, res) => {
  db.all(
    `
      SELECT
        foods.*,
        restaurants.name AS restaurant_name,
        restaurants.location AS restaurant_location
      FROM foods
      JOIN restaurants ON foods.restaurant_id = restaurants.id
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json(rows);
    }
  );
});

app.get("/api/restaurants", (req, res) => {
  db.all("SELECT * FROM restaurants", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
});

app.get("/api/search-foods", (req, res) => {
  const query = String(req.query.query || "").trim();
  const searchValue = `%${query}%`;

  db.all(
    `
      SELECT
        foods.*,
        restaurants.name AS restaurant_name,
        restaurants.location AS restaurant_location
      FROM foods
      JOIN restaurants ON foods.restaurant_id = restaurants.id
      WHERE foods.name LIKE ?
        OR foods.category LIKE ?
        OR restaurants.name LIKE ?
        OR restaurants.location LIKE ?
        OR foods.image LIKE ?
    `,
    [searchValue, searchValue, searchValue, searchValue, searchValue],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json(rows);
    }
  );
});

app.post("/api/add-restaurant", (req, res) => {
  const { name, location } = req.body;

  db.run(
    "INSERT INTO restaurants (name, location) VALUES (?, ?)",
    [name, location],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json({ id: this.lastID });
    }
  );
});

app.post("/api/add-food", (req, res) => {
  const { name, restaurant_id, category, price, rating, image } = req.body;

  db.run(
    `
      INSERT INTO foods (name, restaurant_id, category, price, rating, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, restaurant_id, category, price, rating, image],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
