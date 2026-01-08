// Login Page - HairMatch
// Author: Aya Benyahia

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

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
      
      <button>Se connecter</button>
      
      {msg && <p>{msg}</p>}
    </div>
  );
}
