
import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="topbar">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="subtitle">
          Welcome back! Manage your hotel properties.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <Bell size={21} color="#69747a" />
        <div className="profile">P</div>
      </div>
    </header>
  );
}

export default Navbar;
