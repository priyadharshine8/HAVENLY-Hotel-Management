
import { useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

function Locations() {
  const hotels = useSelector(
    (state) => state.hotels?.hotels || []
  );

  const validHotels = hotels.filter((hotel) => {
    const lat = Number(hotel.latitude);
    const lng = Number(hotel.longitude);

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  const center = validHotels.length
    ? [
        Number(validHotels[0].latitude),
        Number(validHotels[0].longitude),
      ]
    : [11.1271, 78.6569];

  return (
    <div className="locations-page">
      <div className="page-heading">
        <p className="eyebrow">EXPLORE OUR COLLECTION</p>
        <h1>Discover Locations</h1>
        <p>
          Explore our properties across different destinations.
        </p>
      </div>

      <div className="map-info">
        <h3>{validHotels.length} Properties</h3>
        <p>Click any gold marker to explore that property.</p>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={7}
          scrollWheelZoom={false}
          touchZoom={false}
          doubleClickZoom={false}
          dragging={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {validHotels.map((hotel) => (
            <CircleMarker
              key={hotel.id}
              center={[
                Number(hotel.latitude),
                Number(hotel.longitude),
              ]}
              radius={10}
              pathOptions={{
                color: "#B69A72",
                fillColor: "#172A2B",
                fillOpacity: 1,
              }}
            >
              <Popup minWidth={220} maxWidth={260}>
                <div className="map-hotel-popup">
                  <img
                    src={
                      hotel.image ||
                      "https://placehold.co/500x300?text=HAVENLY"
                    }
                    alt={hotel.title || "Hotel property"}
                  />

                  <div className="map-popup-content">
                    <span>{hotel.location}</span>
                    <h3>{hotel.title}</h3>

                    <p>
                      ₹
                      {Number(hotel.price).toLocaleString("en-IN")}
                      <small> / night</small>
                    </p>

                    {hotel.description && (
                      <div className="map-popup-description">
                        {hotel.description}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {validHotels.length === 0 && (
        <p className="empty-state">
          No properties with valid coordinates. Add a property first.
        </p>
      )}
    </div>
  );
}

export default Locations;
