// Register Page - HairMatch
// Author: Aya Benyahia

import { useState } from "react";
import Layout, { colors } from "../components/Layout";
import { styles as s } from "../components/UI";

const API = "http://localhost:3000";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", role: "client" });
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const submit = async () => {
    setMsg("");
    try {
      const r = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await r.json();
      if (!r.ok) throw data;
      setMsg("Compte créé avec succès !");
      setSuccess(true);
    } catch (e) {
      setMsg(e?.error || "Erreur inscription");
      setSuccess(false);
    }
  };

  const box = { background: colors.beige, padding: "44px 40px", borderRadius: 16, width: 440, maxWidth: "90%", boxShadow: "0 20px 60px rgba(85,11,20,0.12)" };
  const label = { display: "block", fontSize: 13, fontWeight: 500, color: colors.taupe, marginBottom: 8, marginTop: 20 };

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={box}>
          <h2 style={{ color: colors.bordeaux, textAlign: "center", marginBottom: 8, fontSize: 26, fontWeight: 700 }}>Inscription</h2>
          <p style={{ textAlign: "center", color: colors.taupe, marginBottom: 32, fontSize: 14 }}>Créez votre compte en quelques secondes</p>

          {[
            { key: "name", label: "Nom complet", placeholder: "Votre nom" },
            { key: "email", label: "Adresse email", placeholder: "exemple@email.com", type: "email" },
            { key: "password", label: "Mot de passe", placeholder: "Choisir un mot de passe", type: "password" },
            { key: "city", label: "Ville", placeholder: "Votre ville" }
          ].map(f => (
            <div key={f.key}>
              <label style={label}>{f.label}</label>
              <input style={s.input} type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]} onChange={e => update(f.key, e.target.value)} />
            </div>
          ))}

          <label style={label}>Type de compte</label>
          <select style={s.input} value={form.role} onChange={e => update("role", e.target.value)}>
            <option value="client">Client</option>
            <option value="hairdresser">Professionnel (Coiffeur)</option>
          </select>

          <button style={{ ...s.btn, width: "100%", marginTop: 24, padding: 16 }} onClick={submit}>Créer mon compte</button>

          {msg && <p style={{ marginTop: 16, textAlign: "center", padding: "12px 14px", borderRadius: 8, fontSize: 14, background: success ? "#e8f5e9" : "#ffebee", color: success ? "#2e7d32" : "#c62828" }}>{msg}</p>}

          <div style={{ height: 1, background: colors.taupe, opacity: 0.2, margin: "28px 0" }} />
          <a href="/" style={{ color: colors.bordeaux, display: "block", textAlign: "center", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>Déjà un compte ? Connexion</a>
        </div>
      </div>
    </Layout>
  );
}
