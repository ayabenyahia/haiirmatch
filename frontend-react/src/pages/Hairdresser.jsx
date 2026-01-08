import { useEffect, useState } from "react";
import Layout, { colors } from "../components/Layout";
import { styles as s, Card, ListItem } from "../components/UI";

const API = "http://localhost:3000";

export default function Hairdresser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "hairdresser") { window.location.href = "/"; return null; }

  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city);
  const [profileMsg, setProfileMsg] = useState("");
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [decisionMsg, setDecisionMsg] = useState("");

  const logout = () => { localStorage.removeItem("user"); window.location.href = "/"; };
  const loadRequests = async (c = city) => setRequests(await (await fetch(`${API}/requests?city=${c}`)).json());
  const loadDetails = async id => { const d = await (await fetch(`${API}/requests/${id}`)).json(); setSelected({ ...d, id }); setPrice(d.price || ""); setComment(d.comment || ""); setDecisionMsg(""); };

  useEffect(() => { loadRequests(); }, []);

  const saveProfile = async () => {
    try {
      const r = await fetch(`${API}/users/${user.user_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, city }) });
      if (!r.ok) throw await r.json();
      localStorage.setItem("user", JSON.stringify({ ...user, name, city }));
      setProfileMsg("Profil mis à jour"); loadRequests(city);
    } catch { setProfileMsg("Erreur lors de la mise à jour"); }
  };

  const decide = async decision => {
    try {
      const r = await fetch(`${API}/responses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request_id: selected.id, hairdresser_id: user.user_id, decision, price, comment }) });
      if (!r.ok) throw await r.json();
      setDecisionMsg("Réponse envoyée"); setSelected(null); setPrice(""); setComment(""); loadRequests();
    } catch { setDecisionMsg("Erreur"); }
  };

  return (
    <Layout user={user} onLogout={logout}>
      <Card title="Mon profil">
        <input style={s.input} placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
        <input style={s.input} placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
        <button style={{ ...s.btn, marginTop: 14 }} onClick={saveProfile}>Enregistrer</button>
        {profileMsg && <p style={s.msg}>{profileMsg}</p>}
      </Card>

      <Card title="Demandes disponibles" badge={city}>
        {requests.length === 0 && <p style={{ opacity: 0.7 }}>Aucune demande dans votre zone</p>}
        {requests.map(r => (
          <ListItem key={r.id} onClick={() => loadDetails(r.id)}>
            <b>Demande #{r.id}</b>
            <p style={{ opacity: 0.8, margin: "6px 0 0" }}>Client : {r.client_name}</p>
          </ListItem>
        ))}
      </Card>

      {selected && (
        <Card title={`Demande #${selected.id}`}>
          <p><b>Ville :</b> {selected.city}</p>
          <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
            {selected.hair_current_photo && <div><p style={s.photoLabel}>Photo actuelle</p><img src={`${API}${selected.hair_current_photo}`} style={{ ...s.img, width: 160, height: 160 }} alt="" /></div>}
            {selected.hair_wanted_photo && <div><p style={s.photoLabel}>Coupe souhaitée</p><img src={`${API}${selected.hair_wanted_photo}`} style={{ ...s.img, width: 160, height: 160 }} alt="" /></div>}
          </div>
          <input style={{ ...s.input, marginTop: 20 }} placeholder="Prix estimé (ex: 80 MAD)" value={price} onChange={e => setPrice(e.target.value)} />
          <textarea style={s.textarea} placeholder="Message au client" value={comment} onChange={e => setComment(e.target.value)} />
          <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
            <button style={s.btnAccept} onClick={() => decide("accepted")}>Accepter</button>
            <button style={s.btnRefuse} onClick={() => decide("refused")}>Refuser</button>
            <button style={s.btnSecondary} onClick={() => setSelected(null)}>Fermer</button>
          </div>
          {decisionMsg && <p style={s.msg}>{decisionMsg}</p>}
        </Card>
      )}
    </Layout>
  );
}
