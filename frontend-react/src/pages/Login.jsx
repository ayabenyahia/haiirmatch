import { useState } from "react";
import Layout, { colors } from "../components/Layout";
import { styles as s } from "../components/UI";

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
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = data.role === "client" ? "/client/request" : "/hairdresser";
    } catch (e) {
      setMsg(e?.error || "Erreur de connexion");
    }
  };

  const box = { background: colors.beige, padding: "44px 40px", borderRadius: 16, width: 420, maxWidth: "90%", boxShadow: "0 20px 60px rgba(85,11,20,0.12)" };
  const label = { display: "block", fontSize: 13, fontWeight: 500, color: colors.taupe, marginBottom: 8, marginTop: 20 };

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={box}>
          <h2 style={{ color: colors.bordeaux, textAlign: "center", marginBottom: 8, fontSize: 26, fontWeight: 700 }}>Connexion</h2>
          <p style={{ textAlign: "center", color: colors.taupe, marginBottom: 32, fontSize: 14 }}>Accédez à votre espace personnel</p>
          
          <label style={label}>Adresse email</label>
          <input style={s.input} type="email" placeholder="exemple@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          
          <label style={label}>Mot de passe</label>
          <input style={s.input} type="password" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
          
          <button style={{ ...s.btn, width: "100%", marginTop: 24, padding: 16 }} onClick={login}>Se connecter</button>
          
          {msg && <p style={{ marginTop: 16, textAlign: "center", color: "#c62828", fontSize: 14 }}>{msg}</p>}
          
          <div style={{ height: 1, background: colors.taupe, opacity: 0.2, margin: "28px 0" }} />
          <a href="/register" style={{ color: colors.bordeaux, display: "block", textAlign: "center", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>Créer un compte</a>
        </div>
      </div>
    </Layout>
  );
}
