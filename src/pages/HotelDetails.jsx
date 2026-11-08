
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addReview } from "../redux/hotelSlice";

import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Compass,
  BedDouble,
  Utensils,
  Waves,
  Building2,
  Camera,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import TourViewer from "../components/TourViewer";

const tourIcons = {
  lobby: Building2,
  rooms: BedDouble,
  restaurant: Utensils,
  pool: Waves,
  exterior: Camera,
};

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get all hotels from Redux
  const hotels = useSelector(
    (state) => state.hotels?.hotels || []
  );

  // Find selected hotel
  const hotel = hotels.find(
    (item) => String(item.id) === String(id)
  );

  // Find hotel folder number
  const hotelIndex = hotels.findIndex(
    (item) => String(item.id) === String(id)
  );

  const [selectedTour, setSelectedTour] = useState(null);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Review submission
  const handleReviewSubmit = (event) => {
    event.preventDefault();

    if (!reviewerName.trim() || !comment.trim()) {
      alert("Please enter your name and review.");
      return;
    }

    const review = {
      id: Date.now().toString(),
      name: reviewerName.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };

    dispatch(
      addReview({
        hotelId: hotel.id,
        review,
      })
    );

    setReviewerName("");
    setRating(5);
    setComment("");

    alert("Review submitted successfully!");
  };

  if (!hotel) {
    return (
      <div className="hotel-not-found">
        <h2>Property not found</h2>
        <button onClick={() => navigate("/hotels")}>
          Back to Properties
        </button>
      </div>
    );
  }

  // SEO metadata
  const seoDescription = (
    hotel.description ||
    `Explore ${hotel.title} in ${hotel.location}.`
  ).slice(0, 160);

  // Coordinates
  const latitude = Number(hotel.latitude);
  const longitude = Number(hotel.longitude);

  const reviews = hotel.reviews || [];

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const hasValidCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // Local 360 panorama images
  const tourSections = [
    {
      id: "lobby",
      title: "Lobby",
      file: "lobby.jpg",
    },
    {
      id: "rooms",
      title: "Guest Rooms",
      file: "room.jpg",
    },
    {
      id: "restaurant",
      title: "Restaurant",
      file: "restaurant.jpg",
    },
    {
      id: "pool",
      title: "Swimming Pool",
      file: "pool.jpg",
    },
    {
      id: "exterior",
      title: "Exterior",
      file: "exterior.jpg",
    },
  ].map((area) => ({
    id: area.id,
    title: area.title,
    panorama:
      hotelIndex >= 0 && hotelIndex < 8
        ? `/hotel-images/hotel${hotelIndex + 1}/${area.file}`
        : "",
  }));

  const availableTours = tourSections.filter(
    (section) => section.panorama
  ).length;

  return (
    <>
      {/* SEO Metadata */}
      <Helmet>
        <title>{`${hotel.title} | HAVENLY`}</title>
        <meta
          name="description"
          content={seoDescription}
        />
      </Helmet>

      <div className="hotel-details-page">

        {/* Back Button */}
        <button
          className="details-back-button"
          onClick={() => navigate("/hotels")}
        >
          <ArrowLeft size={17} />
          Back to Properties
        </button>

        {/* Hero Section */}
        <div className="details-hero">
          <img
            src={
              hotelIndex >= 0 && hotelIndex < 8
                ? `/hotel-images/hotel${hotelIndex + 1}/main.jpg`
                : hotel.image
            }
            alt={hotel.title}
            className="details-hero-image"
          />

          <div className="details-hero-overlay">
            <span className="details-location">
              <MapPin size={15} />
              {hotel.location}
            </span>

            <h1>{hotel.title}</h1>
            <p>{hotel.description}</p>

            <div className="details-price">
              <IndianRupee size={19} />
              <strong>
                {Number(hotel.price).toLocaleString("en-IN")}
              </strong>
              <span>/ night</span>
            </div>
          </div>
        </div>

        {/* 360 Experience */}
        <section className="details-section">
          <div className="details-section-heading">
            <div>
              <span className="details-eyebrow">
                DISCOVER THE PROPERTY
              </span>

              <h2>Explore the 360° Experience</h2>

              <p>
                Choose an area to explore its virtual panorama.
              </p>
            </div>

            <span className="tour-count">
              {availableTours} of 5 tours available
            </span>
          </div>

          <div className="tour-section-grid">
            {tourSections.map((section, index) => {
              const Icon = tourIcons[section.id] || Compass;
              const isAvailable = Boolean(section.panorama);

              return (
                <button
                  type="button"
                  key={section.id}
                  className={`tour-section-card ${
                    isAvailable
                      ? "tour-section-active"
                      : "tour-section-disabled"
                  }`}
                  disabled={!isAvailable}
                  onClick={() => setSelectedTour(section)}
                >
                  <div className="tour-section-icon">
                    <Icon size={23} />
                  </div>

                  <div className="tour-section-info">
                    <span>0{index + 1}</span>
                    <h3>{section.title}</h3>

                    <p>
                      {isAvailable
                        ? "Explore this 360° space"
                        : "360° tour coming soon"}
                    </p>
                  </div>

                  <div className="tour-section-action">
                    {isAvailable ? "Explore →" : "Unavailable"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* About Property */}
        <section className="details-section details-about">
          <div>
            <span className="details-eyebrow">
              ABOUT THE PROPERTY
            </span>

            <h2>Your stay at {hotel.title}</h2>
            <p>{hotel.description}</p>
          </div>

          <div className="details-info-grid">
            <div className="details-info-card">
              <MapPin size={21} />
              <span>Location</span>
              <strong>{hotel.location}</strong>
            </div>

            <div className="details-info-card">
              <IndianRupee size={21} />
              <span>Starting price</span>

              <strong>
                ₹{Number(hotel.price).toLocaleString("en-IN")} / night
              </strong>
            </div>

            <div className="details-info-card">
              <Compass size={21} />
              <span>Virtual tours</span>
              <strong>{availableTours} / 5 available</strong>
            </div>
          </div>
        </section>

        {/* Property Location Map */}
        <section className="details-section">
          <span className="details-eyebrow">FIND YOUR WAY</span>
          <h2>Property Location</h2>

          <div className="details-map-info">
            <MapPin size={21} />

            <div>
              <strong>{hotel.title}</strong>
              <p>{hotel.location}</p>
            </div>
          </div>

          {hasValidCoordinates ? (
            <div className="details-map-wrapper">
              <MapContainer
                key={hotel.id}
                center={[latitude, longitude]}
                zoom={14}
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

                <CircleMarker
                  center={[latitude, longitude]}
                  radius={12}
                  pathOptions={{
                    color: "#B69A72",
                    fillColor: "#172A2B",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <strong>{hotel.title}</strong>
                    <br />
                    {hotel.location}
                  </Popup>
                </CircleMarker>
              </MapContainer>
            </div>
          ) : (
            <p className="empty-state">
              Location coordinates are not available for this property.
            </p>
          )}

          {hasValidCoordinates && (
            <p className="details-map-coordinates">
              Latitude: {latitude} · Longitude: {longitude}
            </p>
          )}
        </section>

        {/* Ratings and Reviews */}
        <section className="details-section reviews-section">
          <span className="details-eyebrow">GUEST FEEDBACK</span>
          <h2>Ratings & Reviews</h2>

          <div className="reviews-summary">
            <strong>{averageRating} / 5</strong>
            <span>⭐</span>
            <p>{reviews.length} customer reviews</p>
          </div>

          <form
            className="review-form"
            onSubmit={handleReviewSubmit}
          >
            <h3>Write a Review</h3>

            <label>Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
            />

            <label>Your Rating</label>
            <div className="review-star-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={star <= rating ? "star-active" : ""}
                >
                  ★
                </button>
              ))}
            </div>

            <label>Your Review</label>
            <textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            <button
              type="submit"
              className="review-submit-button"
            >
              Submit Review
            </button>
          </form>

          <div className="reviews-list">
            <h3>Customer Reviews</h3>

            {reviews.length === 0 ? (
              <p className="no-reviews">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-card-header">
                    <strong>{review.name}</strong>
                    <span>
                      {"★".repeat(Number(review.rating))}
                      {"☆".repeat(5 - Number(review.rating))}
                    </span>
                  </div>

                  <p>{review.comment}</p>

                  <small>
                    {new Date(review.date).toLocaleDateString("en-IN")}
                  </small>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 360 Tour Viewer */}
        {selectedTour && (
          <TourViewer
            panorama={selectedTour.panorama}
            title={`${hotel.title} — ${selectedTour.title}`}
            onClose={() => setSelectedTour(null)}
          />
        )}

      </div>
    </>
  );
}

export default HotelDetails;
