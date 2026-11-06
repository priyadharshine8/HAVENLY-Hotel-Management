
import { MapPin } from "lucide-react";

function HotelCard({ hotel }) {
  return (
    <article className="hotel-card">
      <img
        src={hotel.image}
        alt={hotel.title}
        className="hotel-image"
      />

      <div className="hotel-info">
        <h3>{hotel.title}</h3>

        <p className="hotel-location">
          <MapPin size={13} style={{ verticalAlign: "middle" }} />
          {" "}{hotel.location}
        </p>

        <p className="hotel-price">
          ₹{Number(hotel.price).toLocaleString("en-IN")}
          <span style={{ color: "#92989a", fontSize: "12px" }}>
            {" "}/ night
          </span>
        </p>
      </div>
    </article>
  );
}

export default HotelCard;
