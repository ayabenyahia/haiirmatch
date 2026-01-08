// Server - HairMatch API
// Author: Aya Benyahia

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

// Health check
app.get("/", (req, res) => res.json({ ok: true, name: "HairMatch API" }));

/**
 * AUTH - REGISTER
 * POST /register {name, email, password, role, city}
 */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, city } = req.body;

    console.log("REGISTER BODY ===>", req.body);

    // Validation
    if (!name || !email || !password || !role || !city) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    if (!["client", "hairdresser"].includes(role)) {
      return res.status(400).json({ error: "Role invalide" });
    }

    // Check if email exists
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      "INSERT INTO users (name, email, password_hash, role, city) VALUES (?,?,?,?,?)",
      [name, email, password_hash, role, city]
    );

    return res.status(201).json({ message: "Compte créé avec succès" });

  } catch (err) {
    console.error("REGISTER ERROR ===>", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    return res.status(500).json({
      error: "Erreur serveur",
      details: err.message
    });
  }
});

/**
 * AUTH - LOGIN
 * POST /login {email, password}
 * Returns: {user_id, role, city, name}
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Find user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const user = rows[0];

    // Verify password
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Return user data
    return res.json({
      message: "Connexion réussie",
      user_id: user.id,
      role: user.role,
      city: user.city,
      name: user.name,
    });

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({
      error: "Erreur serveur",
      details: e.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
});
