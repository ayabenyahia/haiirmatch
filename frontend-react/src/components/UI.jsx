import { colors } from "./Layout";

// Shared styles
export const styles = {
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: 14,
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12
  },
  textarea: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: 14,
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    minHeight: 100,
    resize: "vertical",
    fontFamily: "inherit"
  },
  btn: {
    background: colors.bordeaux,
    color: colors.white,
    border: "none",
    padding: "12px 24px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer"
  },
  btnSecondary: {
    background: colors.taupe,
    color: colors.white,
    border: "none",
    padding: "12px 24px",
    borderRadius: 10,
    fontWeight: 500,
    cursor: "pointer"
  },
  btnAccept: {
    background: "#2e7d32",
    color: colors.white,
    border: "none",
    padding: "12px 28px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer"
  },
  btnRefuse: {
    background: "#c62828",
    color: colors.white,
    border: "none",
    padding: "12px 28px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer"
  },
  card: {
    background: colors.beige,
    padding: 28,
    borderRadius: 16,
    marginBottom: 24,
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)"
  },
  cardTitle: {
    color: colors.bordeaux,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 600
  },
  listItem: {
    background: colors.white,
    padding: 18,
    borderRadius: 12,
    marginTop: 12,
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.2s"
  },
  msg: {
    marginTop: 14,
    padding: "12px 16px",
    borderRadius: 8,
    background: "#e8f5e9",
    color: "#2e7d32",
    fontSize: 14
  },
  badge: {
    display: "inline-block",
    background: colors.bordeaux,
    color: colors.white,
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginLeft: 12
  },
  img: {
    width: 140,
    height: 140,
    objectFit: "cover",
    borderRadius: 12,
    border: `3px solid ${colors.bordeaux}`
  },
  photoLabel: {
    fontSize: 13,
    color: colors.taupe,
    marginBottom: 8,
    fontWeight: 500
  }
};

// Status helpers
export const statusStyles = {
  pending: { background: "#fff3e0", color: "#e65100" },
  accepted: { background: "#e8f5e9", color: "#2e7d32" },
  refused: { background: "#ffebee", color: "#c62828" }
};

export const statusLabels = {
  pending: "En attente",
  accepted: "Acceptée",
  refused: "Refusée"
};

// Stars component
export function Stars({ value, onChange, size = 18 }) {
  return (
    <div style={{ marginTop: 8 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          style={{
            cursor: onChange ? "pointer" : "default",
            color: n <= value ? colors.bordeaux : colors.beige,
            fontSize: size,
            marginRight: 4,
            userSelect: "none"
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// List item with hover
export function ListItem({ children, onClick }) {
  return (
    <div
      style={styles.listItem}
      onClick={onClick}
      onMouseOver={e => e.currentTarget.style.borderColor = colors.bordeaux}
      onMouseOut={e => e.currentTarget.style.borderColor = "transparent"}
    >
      {children}
    </div>
  );
}

// Card component
export function Card({ title, badge, children }) {
  return (
    <div style={styles.card}>
      {title && (
        <h2 style={styles.cardTitle}>
          {title}
          {badge && <span style={styles.badge}>{badge}</span>}
        </h2>
      )}
      {children}
    </div>
  );
}

