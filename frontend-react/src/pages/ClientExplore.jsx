import { useState } from "react";
import Layout, { colors } from "../components/Layout";
import { styles as s, Stars, Card, ListItem } from "../components/UI";

const API = "http://localhost:3000";

export default function ClientExplore() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "client") { window.location.href = "/"; return null; }

  const [city, setCity] = useState("");
  const [hairdressers, setHairdressers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [view, setView] = useState("top");

  const logout = () => { localStorage.removeItem("user"); window.location.href = "/"; };

  const search = async () => {
    if (!city) return alert("Entrer une ville");
    setHairdressers(await (await fetch(`${API}/hairdressers?city=${city}`)).json());
    setSelected(null); setReviews([]);
  };

  const openHairdresser = async h => {
    setSelected(h);
    setReviews(await (await fetch(`${API}/hairdressers/${h.id}/reviews`)).json());
  };

  const list = view === "top" ? hairdressers.slice(0, 3) : hairdressers;

  return (
    <Layout user={user} onLogout={logout}>
      <Card title="Rechercher des coiffeurs">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ ...s.input, flex: 1, minWidth: 200, marginBottom: 0 }} placeholder="Ville (ex: Fes)" value={city} onChange={e => setCity(e.target.value)} />
          <button style={{ ...s.btn, padding: "14px 24px" }} onClick={search}>Rechercher</button>
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          {[["top", "Top 3"], ["all", "Tous les résultats"]].map(([v, label]) => (
            <button key={v} style={view === v ? s.btn : s.btnSecondary} onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
      </Card>

      <Card title={`Coiffeurs ${city ? `à ${city}` : ""}`}>
        {list.length === 0 && <p style={{ opacity: 0.7 }}>Aucun coiffeur trouvé</p>}
        {list.map((h, i) => (
          <ListItem key={h.id} onClick={() => openHairdresser(h)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <b style={{ fontSize: 16 }}>{h.name}</b>
                {i < 3 && view === "top" && <span style={s.badge}>Top {i + 1}</span>}
                <p style={{ opacity: 0.8, margin: "6px 0 0" }}>{h.city}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <Stars value={Math.round(h.rating || 0)} />
                <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{h.total_reviews} avis</p>
              </div>
            </div>
          </ListItem>
        ))}
      </Card>

      {selected && (
        <Card title={selected.name}>
          <Stars value={Math.round(selected.rating || 0)} />
          <p style={{ marginTop: 8 }}>{selected.total_reviews} avis clients</p>
          <h3 style={{ color: colors.bordeaux, marginTop: 24, marginBottom: 12 }}>Avis clients</h3>
          {reviews.length === 0 && <p style={{ opacity: 0.7 }}>Aucun avis pour l'instant</p>}
          {reviews.map((r, i) => (
            <div key={i} style={{ background: colors.white, padding: 16, borderRadius: 10, marginTop: 12, borderLeft: `4px solid ${colors.bordeaux}` }}>
              <Stars value={r.stars} />
              <p style={{ margin: "10px 0" }}>{r.comment || "—"}</p>
              <small style={{ color: colors.taupe }}>— {r.client_name}</small>
            </div>
          ))}
          <button style={{ ...s.btnSecondary, marginTop: 24 }} onClick={() => setSelected(null)}>Fermer</button>
        </Card>
      )}
    </Layout>
  );
}
