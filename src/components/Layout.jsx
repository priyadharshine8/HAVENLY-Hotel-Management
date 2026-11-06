import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p>PROPERTY MANAGEMENT</p>
            <h3>Welcome to HAVENLY</h3>
          </div>

          <div className="profile">P</div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;