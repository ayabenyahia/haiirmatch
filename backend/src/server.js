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
app.options("*", cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

// Uploads
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.get("/", (req, res) => res.json({ ok: true, name: "HairMatch API" }));

// POST /requests
app.post("/requests", async (req, res) => {
  try {
    const { client_id, city } = req.body;
    if (!client_id || !city) return res.status(400).json({ error: "Champs manquants" });
    const [userRows] = await db.query("SELECT id, role FROM users WHERE id = ?", [client_id]);
    if (!userRows.length || userRows[0].role !== "client") return res.status(403).json({ error: "client_id invalide" });
    const [result] = await db.query("INSERT INTO requests (client_id, city, status) VALUES (?,?, 'pending')", [client_id, city]);
    return res.status(201).json({ message: "Demande créée", request_id: result.insertId, status: "pending" });
  } catch (e) { return res.status(500).json({ error: "Erreur serveur", details: e.message }); }
});

// GET /requests?city=X
app.get("/requests", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "city est obligatoire" });
    const [rows] = await db.query(`SELECT r.id, r.city, r.status, r.created_at, u.name AS client_name FROM requests r JOIN users u ON u.id = r.client_id WHERE r.city = ? AND r.status = 'pending' ORDER BY r.created_at DESC`, [city]);
    return res.json(rows);
  } catch (e) { return res.status(500).json({ error: "Erreur serveur", details: e.message }); }
});

// GET /requests/:id
app.get("/requests/:id", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT r.id, r.city, r.status, r.hair_current_photo, r.hair_wanted_photo, res.hairdresser_id, res.price, res.comment FROM requests r LEFT JOIN responses res ON res.request_id = r.id AND res.decision = 'accepted' WHERE r.id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Demande introuvable" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: "Erreur chargement demande" }); }
});

// GET /my-requests?client_id=X
app.get("/my-requests", async (req, res) => {
  try {
    const { client_id } = req.query;
    if (!client_id) return res.status(400).json({ error: "client_id obligatoire" });
    const [rows] = await db.query(`SELECT id, city, status, hair_current_photo, hair_wanted_photo, created_at FROM requests WHERE client_id = ? ORDER BY created_at DESC`, [client_id]);
    return res.json(rows);
  } catch (e) { return res.status(500).json({ error: "Erreur serveur", details: e.message }); }
});

// POST /upload
app.post("/upload", upload.fields([{ name: "current", maxCount: 1 }, { name: "wanted", maxCount: 1 }]), async (req, res) => {
  try {
    const { request_id } = req.body;
    if (!request_id) return res.status(400).json({ error: "request_id obligatoire" });
    const currentFile = req.files?.current?.[0];
    const wantedFile = req.files?.wanted?.[0];
    if (!currentFile || !wantedFile) return res.status(400).json({ error: "Deux images sont obligatoires" });
    await db.query("UPDATE requests SET hair_current_photo = ?, hair_wanted_photo = ? WHERE id = ?", [`/uploads/${currentFile.filename}`, `/uploads/${wantedFile.filename}`, request_id]);
    return res.json({ message: "Upload OK" });
  } catch (e) { return res.status(500).json({ error: "Erreur serveur", details: e.message }); }
});

// POST /responses
app.post("/responses", async (req, res) => {
  try {
    const { request_id, hairdresser_id, decision, price, comment } = req.body;
    await db.query(`INSERT INTO responses (request_id, hairdresser_id, decision, price, comment) VALUES (?,?,?,?,?)`, [request_id, hairdresser_id, decision, price || null, comment || null]);
    await db.query("UPDATE requests SET status = ? WHERE id = ?", [decision, request_id]);
    res.json({ message: "Réponse enregistrée" });
  } catch (err) { res.status(500).json({ error: "Erreur réponse" }); }
});

// PUT /users/:id
app.put("/users/:id", async (req, res) => {
  try {
    const { name, city } = req.body;
    if (!name || !city) return res.status(400).json({ error: "Nom et ville obligatoires" });
    const [result] = await db.query("UPDATE users SET name = ?, city = ? WHERE id = ?", [name, city, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({ message: "Profil mis à jour", name, city });
  } catch (err) { res.status(500).json({ error: "Erreur mise à jour profil" }); }
});

/**
 * GET /hairdressers?city=X - list hairdressers by city with ratings
 */
app.get("/hairdressers", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "city obligatoire" });

    const [rows] = await db.query(`
      SELECT u.id, u.name, u.city, ROUND(AVG(r.stars),1) AS rating, COUNT(r.id) AS total_reviews
      FROM users u
      LEFT JOIN ratings r ON r.hairdresser_id = u.id
      WHERE u.role = 'hairdresser' AND u.city = ?
      GROUP BY u.id
      ORDER BY rating DESC
    `, [city]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement coiffeurs" });
  }
});

/**
 * GET /hairdressers/top - top hairdressers globally
 */
app.get("/hairdressers/top", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.city, ROUND(AVG(r.stars),1) AS rating, COUNT(r.id) AS total_reviews
      FROM users u
      LEFT JOIN ratings r ON r.hairdresser_id = u.id
      WHERE u.role = 'hairdresser'
      GROUP BY u.id
      ORDER BY rating DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement coiffeurs" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
});
