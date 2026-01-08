// Login Page - HairMatch
// Author: Aya Benyahia

import { useState } from "react";

const API = "http://localhost:3000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const login = async () => {
    setMsg("");
    try {
      const r = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await r.json();
      if (!r.ok) throw data;
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data));
      
      // Redirect based on role
      window.location.href = data.role === "client" ? "/client/request" : "/hairdresser";
    } catch (e) {
      setMsg(e?.error || "Erreur de connexion");
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <p>Accédez à votre espace personnel</p>
      
      <label>Adresse email</label>
      <input 
        type="email" 
        placeholder="exemple@email.com" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      
      <label>Mot de passe</label>
      <input 
        type="password" 
        placeholder="Votre mot de passe" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
      />
      
      <button onClick={login}>Se connecter</button>
      
      {msg && <p>{msg}</p>}
    </div>
  );
}
