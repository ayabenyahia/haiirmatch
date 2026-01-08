// Server - HairMatch API
// Author: Aya Benyahia

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

// Health check
app.get("/", (req, res) => res.json({ ok: true, name: "HairMatch API" }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 3000}`);
});

