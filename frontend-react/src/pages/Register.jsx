// Register Page - HairMatch
// Author: Aya Benyahia

import { useState } from "react";

const API = "http://localhost:3000";

export default function Register() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    city: "", 
    role: "client" 
  });
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

  return (
    <div>
      <h2>Inscription</h2>
      <p>Créez votre compte en quelques secondes</p>

      <label>Nom complet</label>
      <input placeholder="Votre nom" value={form.name} onChange={e => update("name", e.target.value)} />

      <label>Adresse email</label>
      <input type="email" placeholder="exemple@email.com" value={form.email} onChange={e => update("email", e.target.value)} />

      <label>Mot de passe</label>
      <input type="password" placeholder="Choisir un mot de passe" value={form.password} onChange={e => update("password", e.target.value)} />

      <label>Ville</label>
      <input placeholder="Votre ville" value={form.city} onChange={e => update("city", e.target.value)} />

      <label>Type de compte</label>
      <select value={form.role} onChange={e => update("role", e.target.value)}>
        <option value="client">Client</option>
        <option value="hairdresser">Professionnel (Coiffeur)</option>
      </select>

      <button onClick={submit}>Créer mon compte</button>

      {msg && <p style={{ color: success ? "green" : "red" }}>{msg}</p>}
    </div>
  );
}
