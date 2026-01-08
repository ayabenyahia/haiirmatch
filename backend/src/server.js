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

app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
});
