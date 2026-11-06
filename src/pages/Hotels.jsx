
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteHotel,
  toggleWishlist
} from "../redux/hotelSlice";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  Compass,
  X,
  Heart
} from "lucide-react";

function Hotels() {
  const hotels = useSelector((state) => state.hotels?.hotels || []);
  const wishlistIds = useSelector(
    (state) => state.hotels?.wishlistIds || []
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("default");

  const locations = [
    ...new Set(hotels.map((hotel) => hotel.location).filter(Boolean))
  ];

  const filteredHotels = hotels
    .filter((hotel) => {
      const searchText = `${hotel.title || ""} ${hotel.location || ""}`
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesLocation =
        locationFilter === "all" || hotel.location === locationFilter;

      const price = Number(hotel.price) || 0;

      const matchesMinPrice =
        minPrice === "" || price >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || price <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      if (sort === "low") return Number(a.price) - Number(b.price);
      if (sort === "high") return Number(b.price) - Number(a.price);
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      dispatch(deleteHotel(id));
    }
  };

  const handleWishlist = (id) => {
    dispatch(toggleWishlist(id));
  };

  return (
    <div className="hotels-page">
      <div className="page-heading">
        <p className="eyebrow">PROPERTY COLLECTION</p>
        <h1>All Properties</h1>
        <p>Manage and explore your hotel collection.</p>
      </div>

      <div className="hotel-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
          />
        </div>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="all">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Min price ₹"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Max price ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Default order</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>

        <button
          className="icon-button"
          onClick={clearFilters}
          title="Clear filters"
        >
          <X size={18} />
          Clear
        </button>

        <button
          className="primary-button"
          onClick={() => navigate("/hotels/new")}
        >
          <Plus size={18} /> Add Property
        </button>
      </div>

      <p className="hotel-results-count">
        Showing {filteredHotels.length} of {hotels.length} properties
      </p>

      <div className="hotel-grid">
        {filteredHotels.map((hotel) => {
          const isWishlisted = wishlistIds.includes(hotel.id);

          return (
            <article className="hotel-card" key={hotel.id}>
              <button
                className="hotel-image-link"
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                aria-label={`View ${hotel.title} details`}
              >
                <img
                  src={hotel.image || "https://placehold.co/600x400?text=Hotel"}
                  alt={hotel.title}
                />

                <span className="hotel-view-label">
                  Explore Property <ArrowUpRight size={15} />
                </span>
              </button>

              <div className="hotel-card-content">
                <p className="eyebrow">{hotel.location}</p>

                <button
                  className="hotel-title-link"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  {hotel.title}
                </button>

                <p className="hotel-description">{hotel.description}</p>

                {hotel.tourSections?.some((section) => section.panorama) && (
                  <p className="hotel-tour-available">
                    <Compass size={14} /> 360° Tour Available
                  </p>
                )}

                <div className="hotel-card-footer">
                  <h3>
                    ₹{Number(hotel.price).toLocaleString("en-IN")}
                    <small> / night</small>
                  </h3>

                  <div className="card-actions">
                    <button
                      className={`icon-button wishlist-button ${
                        isWishlisted ? "wishlist-active" : ""
                      }`}
                      title={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      onClick={() => handleWishlist(hotel.id)}
                    >
                      <Heart
                        size={17}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      className="icon-button"
                      title="Edit property"
                      onClick={() => navigate(`/hotels/${hotel.id}/edit`)}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      className="icon-button delete-icon"
                      title="Delete property"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredHotels.length === 0 && (
        <div className="empty-state">
          <h3>No properties found</h3>
          <p>Try changing your filters or add a new property.</p>
        </div>
      )}
    </div>
  );
}

export default Hotels;
