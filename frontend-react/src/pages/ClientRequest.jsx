// ClientRequest Page - HairMatch
// Author: Hiba

import { useEffect, useState } from "react";

const API = "http://localhost:3000";

export default function ClientRequest() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "client") { 
    window.location.href = "/"; 
    return null; 
  }

  const [city, setCity] = useState("");
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");

  const logout = () => { 
    localStorage.removeItem("user"); 
    window.location.href = "/"; 
  };

  const loadRequests = async () => {
    const data = await (await fetch(`${API}/my-requests?client_id=${user.user_id}`)).json();
    setRequests(data);
  };

  useEffect(() => { loadRequests(); }, []);

  return (
    <div>
      <h1>Mes demandes</h1>
      <button onClick={logout}>Déconnexion</button>
      
      <h2>Nouvelle demande</h2>
      <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
      
      <h2>Liste des demandes</h2>
      {requests.map(r => (
        <div key={r.id}>Demande #{r.id} - {r.city}</div>
      ))}
    </div>
  );
}

