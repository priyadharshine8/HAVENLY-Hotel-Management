
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MapPin,
  Settings,
  Hotel,
  Heart,
} from "lucide-react";

function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Properties", path: "/hotels", icon: Building2 },
    { name: "Add Property", path: "/hotels/new", icon: PlusCircle },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Locations", path: "/locations", icon: MapPin },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <Hotel size={27} />
        <span>HAVENLY</span>
      </div>

      <p className="menu-label">MENU</p>

      <nav>
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <p>Find your place.</p>
        <span>Feel at home.</span>
      </div>
    </aside>
  );
}

export default Sidebar;
