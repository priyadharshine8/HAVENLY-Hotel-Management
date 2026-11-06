
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleWishlist } from "../redux/hotelSlice";
import { Heart, MapPin, Eye } from "lucide-react";

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hotels = useSelector((state) => state.hotels.hotels);
  const wishlistIds = useSelector(
    (state) => state.hotels.wishlistIds
  );

  const wishlistHotels = hotels.filter((hotel) =>
    wishlistIds.includes(hotel.id)
  );

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist ❤️</h1>
          <p>Your favorite properties in one place.</p>
        </div>

        <span className="wishlist-count">
          {wishlistHotels.length} Saved Hotels
        </span>
      </div>

      {wishlistHotels.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={48} />
          <h2>No Favorites Yet</h2>
          <p>
            Click the heart icon on any hotel to save it here.
          </p>

          <button onClick={() => navigate("/hotels")}>
            Explore Hotels
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistHotels.map((hotel) => (
            <article className="wishlist-card" key={hotel.id}>
              <img
                className="wishlist-card-image"
                src={hotel.image}
                alt={hotel.title}
              />

              <button
                type="button"
                className="wishlist-remove"
                aria-label={`Remove ${hotel.title} from wishlist`}
                onClick={() => dispatch(toggleWishlist(hotel.id))}
              >
                <Heart size={20} fill="currentColor" />
              </button>

              <div className="wishlist-card-content">
                <h3>{hotel.title}</h3>

                <p className="wishlist-location">
                  <MapPin size={15} />
                  {hotel.location}
                </p>

                <div className="wishlist-card-footer">
                  <p className="wishlist-price">
                    ₹{hotel.price}
                    <small>per night</small>
                  </p>

                  <button
                    className="wishlist-view-button"
                    onClick={() =>
                      navigate(`/hotels/${hotel.id}`)
                    }
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
