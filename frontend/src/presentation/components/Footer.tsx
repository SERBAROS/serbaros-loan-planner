import Logo from "./Logo";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-soft)",
        background: "var(--surface)",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        flex: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Logo variant="principal" height={60} />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Serbaros Developing Technology
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          © {year} Serbaros · Loan Planner
        </span>
        <ThemeSwitcher />
      </div>
    </footer>
  );
}
