const express = require("express") //express is the web server framwork
const sqlite3 = require("sqlite3").verbose() //sqlite3 is the database library
const cors = require("cors") //cors is a middleware that allows cross-origin requests, which is necessary for the frontend to communicate with the backend

const app = express()
app.use(cors())
app.use(express.json())

const db = new sqlite3.Database("./database.db")
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            price REAL,
            rating REAL,
            Location TEXT
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
    const { name, category, price, rating, Location } = req.body
    db.run(
        `INSERT INTO foods (name, category, price, rating, Location) VALUES (?, ?, ?, ?, ?)`,
        [name, category, price, rating, Location],
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

app.get("/search" , (req, res) => {
    const { query } = req.query
    db.all(
        `SELECT * FROM foods WHERE name LIKE ? OR category LIKE ? OR Location LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.json(rows)
        }
    )

})