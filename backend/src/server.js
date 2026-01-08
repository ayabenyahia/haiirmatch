const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const db = require("./db");

const app = express();
app.use(cors());
app.options("*", cors()); // ✅ FIX PUT / DELETE / PATCH
app.use(express.json());
console.log("SERVER FILE LOADED");

// Auto-migration: ajouter les colonnes manquantes
(async () => {
  try {
    await db.query(`ALTER TABLE responses ADD COLUMN price VARCHAR(100) DEFAULT NULL`);
    console.log("✓ Colonne 'price' ajoutée");
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log("price existe déjà"); }
  try {
    await db.query(`ALTER TABLE responses ADD COLUMN comment TEXT DEFAULT NULL`);
    console.log("✓ Colonne 'comment' ajoutée");
  } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log("comment existe déjà"); }
})();

// uploads folder
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer config (2 images max)
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

// Health
app.get("/", (req, res) => res.json({ ok: true, name: "HairConnect API" }));

/**
 * AUTH
 * POST /register  {name,email,password,role,city}
 */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, city } = req.body;

    console.log("REGISTER BODY ===>", req.body);

    if (!name || !email || !password || !role || !city) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    if (!["client", "hairdresser"].includes(role)) {
      return res.status(400).json({ error: "Role invalide" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password_hash, role, city) VALUES (?,?,?,?,?)",
      [name, email, password_hash, role, city]
    );

    return res.status(201).json({ message: "Compte créé avec succès" });

  } catch (err) {
    console.error("REGISTER ERROR ===>", err);

    // 🔐 sécurité si jamais MySQL déclenche quand même un duplicate
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
 * POST /login {email,password}
 * => {user_id, role, city, name}
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

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

/**
 * REQUESTS
 * POST /requests {client_id, city}
 * status = pending
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

/**
 * GET /requests?city=Casablanca
 * hairdresser sees only pending
 */
app.get("/requests", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "city est obligatoire" });

    const [rows] = await db.query(
      `SELECT r.id, r.city, r.status, r.created_at, u.name AS client_name
       FROM requests r
       JOIN users u ON u.id = r.client_id
       WHERE r.city = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [city]
    );

    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
});
// 🔹 Mise à jour profil utilisateur


// ===============================
// GET REQUEST DETAILS (FIXED)
// ===============================
app.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        r.id,
        r.city,
        r.status,
        r.hair_current_photo,
        r.hair_wanted_photo,
        res.hairdresser_id,
        res.price,
        res.comment
      FROM requests r
      LEFT JOIN responses res 
        ON res.request_id = r.id
       AND res.decision = 'accepted'
      WHERE r.id = ?
      LIMIT 1
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Demande introuvable" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur chargement demande" });
  }
});




/**
 * GET /my-requests?client_id=1
 */
app.get("/my-requests", async (req, res) => {
  try {
    const { client_id } = req.query;
    if (!client_id) return res.status(400).json({ error: "client_id obligatoire" });

    const [rows] = await db.query(
      `SELECT id, city, status, hair_current_photo, hair_wanted_photo, created_at
       FROM requests
       WHERE client_id = ?
       ORDER BY created_at DESC`,
      [client_id]
    );

    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur", details: e.message });
  }
});

/**
 * PHOTOS
 * POST /upload (multipart/form-data)
 * fields: request_id, current (file), wanted (file)
 */
app.post(
  "/upload",
  upload.fields([{ name: "current", maxCount: 1 }, { name: "wanted", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { request_id } = req.body;
      if (!request_id) return res.status(400).json({ error: "request_id obligatoire" });

      const currentFile = req.files?.current?.[0];
      const wantedFile = req.files?.wanted?.[0];
      if (!currentFile || !wantedFile) return res.status(400).json({ error: "Deux images sont obligatoires" });

      const currentPath = `/uploads/${currentFile.filename}`;
      const wantedPath = `/uploads/${wantedFile.filename}`;

      await db.query(
        "UPDATE requests SET hair_current_photo = ?, hair_wanted_photo = ? WHERE id = ?",
        [currentPath, wantedPath, request_id]
      );

      return res.json({ message: "Upload OK", hair_current_photo: currentPath, hair_wanted_photo: wantedPath });
    } catch (e) {
      return res.status(500).json({ error: "Erreur serveur", details: e.message });
    }
  }
);

/**
 * RESPONSES
 * POST /responses {request_id, hairdresser_id, decision}
 * decision: accepted/refused
 * update request status
 */
app.post("/responses", async (req, res) => {
  try {
    const { request_id, hairdresser_id, decision, price, comment } = req.body;

    await db.query(
      `INSERT INTO responses (request_id, hairdresser_id, decision, price, comment)
       VALUES (?,?,?,?,?)`,
      [request_id, hairdresser_id, decision, price || null, comment || null]
    );

    await db.query(
      "UPDATE requests SET status = ? WHERE id = ?",
      [decision, request_id]
    );

    res.json({ message: "Réponse enregistrée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur réponse" });
  }
});

// ===============================
// 🔹 UPDATE USER PROFILE
// ===============================
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city } = req.body;

    console.log("UPDATE USER:", id, name, city);

    if (!name || !city) {
      return res.status(400).json({ error: "Nom et ville obligatoires" });
    }

    const [result] = await db.query(
      "UPDATE users SET name = ?, city = ? WHERE id = ?",
      [name, city, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json({
      message: "Profil mis à jour",
      name,
      city
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ error: "Erreur mise à jour profil" });
  }
});
app.get("/hairdressers/top", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.city,
        ROUND(AVG(r.stars),1) AS rating,
        COUNT(r.id) AS total_reviews
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
// ===============================
// 💬 GET REVIEWS FOR ONE HAIRDRESSER
// ===============================
app.get("/hairdressers/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        r.stars,
        r.comment,
        r.created_at,
        u.name AS client_name
      FROM ratings r
      JOIN users u ON u.id = r.client_id
      WHERE r.hairdresser_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    res.json(rows);
  } catch (err) {
    console.error("REVIEWS ERROR:", err);
    res.status(500).json({ error: "Erreur chargement avis" });
  }
});

app.get("/hairdressers", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: "city obligatoire" });
    }

    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.city,
        ROUND(AVG(r.stars),1) AS rating,
        COUNT(r.id) AS total_reviews
      FROM users u
      LEFT JOIN ratings r ON r.hairdresser_id = u.id
      WHERE u.role = 'hairdresser'
        AND u.city = ?
      GROUP BY u.id
      ORDER BY rating DESC
    `, [city]);

    res.json(rows);
  } catch (err) {
    console.error("HAIRDRESSERS ERROR:", err);
    res.status(500).json({ error: "Erreur chargement coiffeurs" });
  }
});
// ===============================
// ⭐ RATINGS (UNIQUE ET PROPRE)
// ===============================
app.post("/ratings", async (req, res) => {
  try {
    const { client_id, hairdresser_id, request_id, stars, comment } = req.body;

    if (!client_id || !hairdresser_id || !request_id || !stars) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Note invalide" });
    }

    // vérifier que la demande appartient au client
    const [reqRows] = await db.query(
      "SELECT id FROM requests WHERE id = ? AND client_id = ?",
      [request_id, client_id]
    );

    if (!reqRows.length) {
      return res.status(403).json({ error: "Demande invalide" });
    }

    // éviter double notation
    const [existing] = await db.query(
      "SELECT id FROM ratings WHERE request_id = ?",
      [request_id]
    );

    if (existing.length) {
      return res.status(409).json({ error: "Déjà notée" });
    }

    await db.query(
      `INSERT INTO ratings (client_id, hairdresser_id, request_id, stars, comment)
       VALUES (?,?,?,?,?)`,
      [client_id, hairdresser_id, request_id, stars, comment || null]
    );

    res.json({ message: "Note enregistrée" });
  } catch (err) {
    console.error("RATING ERROR:", err);
    res.status(500).json({ error: "Erreur rating" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
});
