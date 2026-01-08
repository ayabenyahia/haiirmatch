// Layout Component - HairMatch
// Author: Aya Benyahia

export const colors = {
  white: "#f8f8f7",
  beige: "#cbc0b2",
  bordeaux: "#550b14",
  taupe: "#7e6961"
};

export function Header({ user, onLogout }) {
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

  return (
    <header style={headerStyle}>
      <a href="/" style={{ textDecoration: "none", color: colors.white, fontSize: 22, fontWeight: 700 }}>
        AHA Beauty
      </a>
      <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!user && (
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
  return (
    <footer style={{ background: colors.taupe, color: colors.white, padding: "28px 40px", marginTop: "auto" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>AHA Beauty</span>
        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 16 }}>
          © 2026 AHA Beauty — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: colors.white }}>
      <Header />
      <main style={{ flex: 1, padding: "40px 30px", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

