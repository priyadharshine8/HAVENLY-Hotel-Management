import { useDispatch } from "react-redux";
import { resetHotels } from "../redux/hotelSlice";
import { RotateCcw } from "lucide-react";

function Settings() {
  const dispatch = useDispatch();

  const handleReset = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all properties to demo data?"
    );

    if (confirmReset) {
      dispatch(resetHotels());
      alert("Demo data restored successfully!");
    }
  };

  return (
    <div className="settings-page">
      <div className="page-heading">
        <p className="eyebrow">APPLICATION PREFERENCES</p>
        <h1>Settings</h1>
        <p>Manage your HAVENLY application.</p>
      </div>

      <div className="settings-card">
        <h3>About HAVENLY</h3>
        <p>Smart Stay Discovery & Property Management.</p>
        <p>Find your place. Feel at home.</p>
      </div>

      <div className="settings-card">
        <h3>Demo Data</h3>
        <p>Restore the original sample properties.</p>

        <button className="reset-button" onClick={handleReset}>
          <RotateCcw size={17} />
          Reset Demo Properties
        </button>
      </div>
    </div>
  );
}

export default Settings;