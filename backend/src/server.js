// Server - HairMatch API
// Author: Anas

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

// Uploads folder
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safe = file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Health check
app.get("/", (req, res) => res.json({ ok: true, name: "HairMatch API" }));

/**
 * REQUESTS
 * POST /requests {client_id, city}
 */
app.post("/requests", async (req, res) => {
  try {
    const { client_id, city } = req.body;
    if (!client_id || !city) return res.status(400).json({ error: "Champs manquants" });

    const [userRows] = await db.query("SELECT id, role FROM users WHERE id = ?", [client_id]);
    if (!userRows.length || userRows[0].role !== "client") {
      return res.status(403).json({ error: "client_id invalide" });
    }

    const [result] = await db.query(
      "INSERT INTO requests (client_id, city, status) VALUES (?,?, 'pending')",
      [client_id, city]
    );

    return res.status(201).json({ message: "Demande créée", request_id: result.insertId, status: "pending" });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
});
