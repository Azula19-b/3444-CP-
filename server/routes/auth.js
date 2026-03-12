const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const usersFilePath = path.join(__dirname, "..", "data", "users.json");
const JWT_SECRET = "quickbytes_secret_key";

function readUsers() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]");
  }

  const data = fs.readFileSync(usersFilePath, "utf-8");
  return JSON.parse(data || "[]");
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    const users = readUsers();

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    users.push(newUser);
    writeUsers(users);

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during signup."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const users = readUsers();

    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "1d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login."
    });
  }
});

module.exports = router;
