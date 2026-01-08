// Hairdresser Page - HairMatch
// Author: Hiba

import { useEffect, useState } from "react";

const API = "http://localhost:3000";

export default function Hairdresser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "hairdresser") { window.location.href = "/"; return null; }

  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city);

  const logout = () => { localStorage.removeItem("user"); window.location.href = "/"; };
  
  const loadRequests = async (c = city) => {
    setRequests(await (await fetch(`${API}/requests?city=${c}`)).json());
  };

  useEffect(() => { loadRequests(); }, []);

  return (
    <div>
      <h1>Espace Coiffeur</h1>
      <button onClick={logout}>Déconnexion</button>
      
      <h2>Mon profil</h2>
      <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
      
      <h2>Demandes disponibles ({city})</h2>
      {requests.map(r => (
        <div key={r.id}>Demande #{r.id} - Client: {r.client_name}</div>
      ))}
    </div>
  );
}

