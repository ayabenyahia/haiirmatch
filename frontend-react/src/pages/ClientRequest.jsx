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
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [wantedPhoto, setWantedPhoto] = useState(null);

  const logout = () => { 
    localStorage.removeItem("user"); 
    window.location.href = "/"; 
  };

  const loadRequests = async () => {
    const data = await (await fetch(`${API}/my-requests?client_id=${user.user_id}`)).json();
    setRequests(data);
  };

  const loadDetails = async id => { 
    const d = await (await fetch(`${API}/requests/${id}`)).json(); 
    setSelected({ ...d, id }); 
  };

  useEffect(() => { loadRequests(); }, []);

  const createRequest = async () => {
    if (!city || !currentPhoto || !wantedPhoto) return alert("Tous les champs sont obligatoires");
    
    const r = await fetch(`${API}/requests`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ client_id: user.user_id, city }) 
    });
    const data = await r.json();
    if (!r.ok) return alert("Erreur création demande");
    
    const form = new FormData();
    form.append("request_id", data.request_id);
    form.append("current", currentPhoto);
    form.append("wanted", wantedPhoto);
    await fetch(`${API}/upload`, { method: "POST", body: form });
    
    setMsg("Demande envoyée avec succès");
    setCity(""); setCurrentPhoto(null); setWantedPhoto(null);
    loadRequests();
  };

  return (
    <div>
      <h1>Mes demandes</h1>
      <button onClick={logout}>Déconnexion</button>
      
      <h2>Nouvelle demande</h2>
      <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
      <input type="file" accept="image/*" onChange={e => setCurrentPhoto(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={e => setWantedPhoto(e.target.files[0])} />
      <button onClick={createRequest}>Envoyer</button>
      {msg && <p>{msg}</p>}
      
      <h2>Liste des demandes</h2>
      {requests.map(r => (
        <div key={r.id} onClick={() => loadDetails(r.id)}>
          Demande #{r.id} - {r.city} - {r.status}
        </div>
      ))}
      
      {selected && (
        <div>
          <h3>Détails #{selected.id}</h3>
          {selected.hair_current_photo && <img src={`${API}${selected.hair_current_photo}`} alt="" />}
          {selected.hair_wanted_photo && <img src={`${API}${selected.hair_wanted_photo}`} alt="" />}
          <button onClick={() => setSelected(null)}>Fermer</button>
        </div>
      )}
    </div>
  );
}
