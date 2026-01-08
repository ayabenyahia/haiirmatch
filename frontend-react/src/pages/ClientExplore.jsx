// ClientExplore Page - HairMatch
// Author: Hiba

import { useState } from "react";

const API = "http://localhost:3000";

export default function ClientExplore() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "client") { window.location.href = "/"; return null; }

  const [city, setCity] = useState("");
  const [hairdressers, setHairdressers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);

  const logout = () => { localStorage.removeItem("user"); window.location.href = "/"; };

  const search = async () => {
    if (!city) return alert("Entrer une ville");
    setHairdressers(await (await fetch(`${API}/hairdressers?city=${city}`)).json());
    setSelected(null); setReviews([]);
  };

  return (
    <div>
      <h1>Explorer les coiffeurs</h1>
      <button onClick={logout}>Déconnexion</button>
      
      <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
      <button onClick={search}>Rechercher</button>
      
      {hairdressers.map(h => (
        <div key={h.id}>
          {h.name} - {h.city} - {h.rating} étoiles
        </div>
      ))}
    </div>
  );
}

