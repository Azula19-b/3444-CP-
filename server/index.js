import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "data", "users.json");

app.use(cors());
app.use(express.json());

function readUsers() {
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

app.get("/", (req, res) => {
  res.send("QuickBytes backend is running.");
});

app.post("/api/signup", (req, res) => {
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

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
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

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();

  const foundUser = users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
  );

  if (!foundUser) {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
