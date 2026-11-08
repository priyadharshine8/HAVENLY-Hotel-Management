
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  deleteHotel,
  toggleWishlist
} from "../redux/hotelSlice";

import { removeHotel } from "../services/hotelApi";

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

// Calculate distance between two locations in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

function Hotels() {
  const hotels = useSelector(
    (state) => state.hotels?.hotels || []
  );

  const wishlistIds = useSelector(
    (state) => state.hotels?.wishlistIds || []
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Filter states
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("default");

  // Geolocation states
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 6;

  // Get local hotel image
  const getHotelImage = (hotel) => {
    const hotelIndex = hotels.findIndex(
      (item) => item.id === hotel.id
    );

    if (hotelIndex >= 0 && hotelIndex < 8) {
      return `/hotel-images/hotel${hotelIndex + 1}/main.jpg`;
    }

    return hotel.image || "https://placehold.co/600x400?text=Hotel";
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    locationFilter,
    minPrice,
    maxPrice,
    sort,
    nearbyRadius,
    userLocation
  ]);

  // Get unique hotel locations
  const locations = [
    ...new Set(
      hotels.map((hotel) => hotel.location).filter(Boolean)
    )
  ];

  // Search, filter and sort
  const filteredHotels = hotels
    .filter((hotel) => {
      const searchText = `${hotel.title || ""} ${
        hotel.location || ""
      }`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesLocation =
        locationFilter === "all" ||
        hotel.location === locationFilter;

      const price = Number(hotel.price) || 0;

      const matchesMinPrice =
        minPrice === "" || price >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || price <= Number(maxPrice);

      let matchesNearby = true;

      if (nearbyRadius !== "all") {
        const latitude = Number(hotel.latitude);
        const longitude = Number(hotel.longitude);

        const validCoordinates =
          userLocation &&
          hotel.latitude !== null &&
          hotel.latitude !== undefined &&
          hotel.latitude !== "" &&
          hotel.longitude !== null &&
          hotel.longitude !== undefined &&
          hotel.longitude !== "" &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180;

        if (!validCoordinates) {
          matchesNearby = false;
        } else {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            latitude,
            longitude
          );

          matchesNearby = distance <= Number(nearbyRadius);
        }
      }

      return (
        matchesSearch &&
        matchesLocation &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesNearby
      );
    })
    .sort((a, b) => {
      if (sort === "low") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "high") {
        return Number(b.price) - Number(a.price);
      }

      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredHotels.length / hotelsPerPage
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;

  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setUserLocation(location);
        setLocationLoading(false);

        toast.success("Your location detected successfully!");
        console.log("User Location:", location);
      },
      (error) => {
        setLocationLoading(false);

        toast.error(
          "Unable to access your location. Please allow permission."
        );

        console.log("Location Error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setLocationFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
    setNearbyRadius("all");
    setUserLocation(null);
    setCurrentPage(1);
  };

  // Delete hotel from PostgreSQL
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property?"
      )
    ) {
      try {
        await removeHotel(id);
        dispatch(deleteHotel(id));
        toast.success("Property deleted successfully!");
      } catch (error) {
        console.error("Hotel delete error:", error);
        toast.error(
          "Unable to delete property. Please try again."
        );
      }
    }
  };

  // Wishlist
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

        <button
          className="icon-button"
          onClick={handleGetLocation}
          disabled={locationLoading}
        >
          <Compass size={18} />
          {locationLoading ? "Detecting..." : "Find Nearby"}
        </button>

        <select
          value={nearbyRadius}
          onChange={(e) => setNearbyRadius(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Distances</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
          <option value="50">Within 50 km</option>
        </select>

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

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
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

      {/* Hotel Cards */}
      <div className="hotel-grid">

        {currentHotels.map((hotel) => {
          const isWishlisted = wishlistIds.includes(hotel.id);

          return (
            <article className="hotel-card" key={hotel.id}>

              <button
                className="hotel-image-link"
                onClick={() => navigate(`/hotels/${hotel.id}`)}
                aria-label={`View ${hotel.title} details`}
              >
                <img
                  src={getHotelImage(hotel)}
                  alt={hotel.title || "Hotel property"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      hotel.image ||
                      "https://placehold.co/600x400?text=Hotel";
                  }}
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

                <p className="hotel-description">
                  {hotel.description}
                </p>

                {hotel.tourSections?.some(
                  (section) => section.panorama
                ) && (
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
                        fill={
                          isWishlisted ? "currentColor" : "none"
                        }
                      />
                    </button>

                    <button
                      className="icon-button"
                      title="Edit property"
                      onClick={() =>
                        navigate(`/hotels/${hotel.id}/edit`)
                      }
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

      {/* Empty State */}
      {filteredHotels.length === 0 && (
        <div className="empty-state">
          <h3>No properties found</h3>
          <p>
            Try changing your filters or add a new property.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              className={
                currentPage === page ? "active-page" : ""
              }
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
}

export default Hotels;
