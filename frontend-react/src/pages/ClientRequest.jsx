import { useEffect, useState } from "react";
import Layout, { colors } from "../components/Layout";
import { styles as s, Stars, Card, ListItem, statusStyles, statusLabels } from "../components/UI";

const API = "http://localhost:3000";

export default function ClientRequest() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "client") { window.location.href = "/"; return null; }

  const [city, setCity] = useState("");
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [wantedPhoto, setWantedPhoto] = useState(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [rateMsg, setRateMsg] = useState("");

  const logout = () => { localStorage.removeItem("user"); window.location.href = "/"; };
  const loadRequests = async () => setRequests(await (await fetch(`${API}/my-requests?client_id=${user.user_id}`)).json());
  const loadDetails = async id => { const d = await (await fetch(`${API}/requests/${id}`)).json(); setSelected({ ...d, id }); setRateMsg(""); };

  useEffect(() => { loadRequests(); }, []);

  const createRequest = async () => {
    if (!city || !currentPhoto || !wantedPhoto) return alert("Tous les champs sont obligatoires");
    const r = await fetch(`${API}/requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: user.user_id, city }) });
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

  const rate = async () => {
    if (!stars) return setRateMsg("Veuillez sélectionner une note");
    try {
      const r = await fetch(`${API}/ratings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: user.user_id, hairdresser_id: selected.hairdresser_id, request_id: selected.id, stars, comment }) });
      if (!r.ok) throw await r.json();
      setRateMsg("Merci pour votre avis !"); setStars(0); setComment("");
    } catch (e) { setRateMsg(e?.error || "Erreur lors de l'envoi"); }
  };

  const fileInput = { ...s.input, padding: 12, cursor: "pointer" };
  const status = st => ({ display: "inline-block", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginLeft: 12, ...statusStyles[st] });

  return (
    <Layout user={user} onLogout={logout}>
      <Card title="Nouvelle demande">
        <input style={s.input} placeholder="Ville (ex: Fes, Casablanca...)" value={city} onChange={e => setCity(e.target.value)} />
        <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
          {[["currentPhoto", "Photo actuelle", setCurrentPhoto], ["wantedPhoto", "Coupe souhaitée", setWantedPhoto]].map(([, label, setter]) => (
            <div key={label} style={{ flex: 1, minWidth: 200 }}>
              <p style={s.photoLabel}>{label}</p>
              <input style={fileInput} type="file" accept="image/*" onChange={e => setter(e.target.files[0])} />
            </div>
          ))}
        </div>
        <button style={{ ...s.btn, marginTop: 16 }} onClick={createRequest}>Envoyer la demande</button>
        {msg && <p style={s.msg}>{msg}</p>}
      </Card>

      <Card title="Mes demandes">
        {requests.length === 0 && <p style={{ opacity: 0.7 }}>Aucune demande pour l'instant</p>}
        {requests.map(r => (
          <ListItem key={r.id} onClick={() => loadDetails(r.id)}>
            <b>Demande #{r.id}</b> — {r.city}
            <span style={status(r.status)}>{statusLabels[r.status]}</span>
          </ListItem>
        ))}
      </Card>

      {selected && (
        <Card title={`Détails de la demande #${selected.id}`}>
          <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {selected.hair_current_photo && <div><p style={s.photoLabel}>Photo actuelle</p><img src={`${API}${selected.hair_current_photo}`} style={s.img} alt="" /></div>}
            {selected.hair_wanted_photo && <div><p style={s.photoLabel}>Coupe souhaitée</p><img src={`${API}${selected.hair_wanted_photo}`} style={s.img} alt="" /></div>}
          </div>
          {selected.comment && <p style={{ marginTop: 20 }}><b>Message :</b> {selected.comment}</p>}
          {selected.price && <p><b>Prix :</b> {selected.price}</p>}
          {selected.hairdresser_id ? (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ color: colors.bordeaux, marginBottom: 12 }}>Noter le coiffeur</h3>
              <Stars value={stars} onChange={setStars} size={26} />
              <textarea style={{ ...s.textarea, marginTop: 12 }} placeholder="Votre commentaire (optionnel)" value={comment} onChange={e => setComment(e.target.value)} />
              <button style={{ ...s.btn, marginTop: 16 }} onClick={rate}>Envoyer la note</button>
              {rateMsg && <p style={{ marginTop: 12, fontSize: 14 }}>{rateMsg}</p>}
            </div>
          ) : <p style={{ marginTop: 20, opacity: 0.7 }}>En attente d'un coiffeur...</p>}
          <button style={{ ...s.btnSecondary, marginTop: 20 }} onClick={() => setSelected(null)}>Fermer</button>
        </Card>
      )}
    </Layout>
  );
}
