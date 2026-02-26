const express = require("express") //express is the web server framwork
const sqlite3 = require("sqlite3").verbose() //sqlite3 is the database library
const cors = require("cors") //cors is a middleware that allows cross-origin requests, which is necessary for the frontend to communicate with the backend

const app = express()
app.use(cors())
app.use(express.json())

// How the database works:
// We have two tables Resturants and foods
// they are connected by the restaurant_id which connnects the two
// every food needs to needs to have a restaurant 
const db = new sqlite3.Database("./database.db")
db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      UNIQUE(name, location)
    )
  `)

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
    `)
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})


app.get("/", (req, res) => {
    res.send("Hello World")
})

app.post("/add-food", (req, res) => {
    const { name, restaurant_id, category, price, rating, image } = req.body
    db.run(
        `INSERT INTO foods (name, restaurant_id, category, price, rating, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, restaurant_id, category, price, rating, image],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.json({ id: this.lastID })
        }
    )
})

app.post("/add-restaurant", (req, res) => {
    const { name, location } = req.body
    db.run(
        `INSERT INTO restaurants (name, location) VALUES (?, ?)`,
        [name, location],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.json({ id: this.lastID })
        }
    )
})

app.get("/foods", (req, res) => {
    db.all(`SELECT * FROM foods`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.json(rows)
    })
})

app.get("/restaurants", (req, res) => {
    db.all(`SELECT * FROM restaurants`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.json(rows)
    })
})

app.get("/search-foods" , (req, res) => {
    const { query } = req.query
    db.all(
        `SELECT * FROM foods WHERE name LIKE ? OR category LIKE ? OR Locatgion LIKE ? OR image LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.json(rows)
        }
    )

})

app.get("/search-restaurants" , (req, res) => {
    const { query } = req.query
    db.all(
        `SELECT * FROM restaurants WHERE name LIKE ? OR location LIKE ?`,
        [`%${query}%`, `%${query}%`],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.json(rows)
        }
    ) 
})