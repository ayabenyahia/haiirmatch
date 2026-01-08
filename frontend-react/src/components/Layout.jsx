export const colors = {
  white: "#f8f8f7",
  beige: "#cbc0b2",
  bordeaux: "#550b14",
  taupe: "#7e6961"
};

const headerStyle = {
  background: colors.bordeaux,
  padding: "0 40px",
  height: 70,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 20px rgba(85,11,20,0.25)"
};

const linkStyle = {
  color: colors.white,
  textDecoration: "none",
  padding: "10px 18px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500
};

export function Header({ user, onLogout }) {
  return (
    <header style={headerStyle}>
      <a href="/" style={{ textDecoration: "none", color: colors.white, fontSize: 22, fontWeight: 700 }}>
        AHA Beauty
      </a>
      <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {user ? (
          <>
            {user.role === "client" && (
              <>
                <a href="/client/request" style={linkStyle}>Mes demandes</a>
                <a href="/client/explore" style={linkStyle}>Explorer</a>
              </>
            )}
            {user.role === "hairdresser" && <a href="/hairdresser" style={linkStyle}>Espace Pro</a>}
            <span style={{ color: colors.beige, fontSize: 13, padding: "0 16px", borderLeft: "1px solid rgba(255,255,255,0.2)", marginLeft: 8 }}>
              {user.name}
            </span>
            <button onClick={onLogout} style={{ background: colors.white, color: colors.bordeaux, border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <a href="/" style={linkStyle}>Connexion</a>
            <a href="/register" style={{ ...linkStyle, background: "rgba(255,255,255,0.15)" }}>Inscription</a>
          </>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  const footerLink = { color: colors.beige, textDecoration: "none", fontSize: 13 };
  return (
    <footer style={{ background: colors.taupe, color: colors.white, padding: "28px 40px", marginTop: "auto" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>AHA Beauty</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Mentions légales", "Contact", "À propos"].map(t => <a key={t} href="#" style={footerLink}>{t}</a>)}
        </div>
        <p style={{ fontSize: 12, opacity: 0.8, width: "100%", textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          © 2026 AHA Beauty — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}

export default function Layout({ children, user, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: colors.white, fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <Header user={user} onLogout={onLogout} />
      <main style={{ flex: 1, padding: "40px 30px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
