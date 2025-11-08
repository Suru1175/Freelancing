const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Srushti@1175",
  database: "freelancing",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection error:", err);
  } else {
    console.log("MySQL connected");
  }
});

// API to save contact form
app.post("/contact", (req, res) => {
  const { name, branch, phone, email, message } = req.body;

  const sql = `INSERT INTO contact_messages (name, branch, phone, email, message)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [name, branch, phone, email, message], (err, result) => {
    if (err) {
      console.error("Error inserting:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ success: true, message: "Contact saved!" });
  });
});

// Server start
app.listen(5000, () => console.log("Server running on port 5000"));
