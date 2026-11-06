
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Hotels from "./pages/Hotels";
import HotelForm from "./pages/HotelForm";
import HotelDetails from "./pages/HotelDetails";
import Locations from "./pages/Locations";
import Settings from "./pages/Settings";
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/new" element={<HotelForm />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/hotels/:id/edit" element={<HotelForm />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Route>
    </Routes>
  );
}

export default App;
