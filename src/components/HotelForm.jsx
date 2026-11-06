
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { addHotel, updateHotel } from "../redux/hotelSlice";

const TOUR_AREAS = [
  { id: "lobby", title: "Lobby" },
  { id: "rooms", title: "Guest Rooms" },
  { id: "restaurant", title: "Restaurant" },
  { id: "pool", title: "Swimming Pool" },
  { id: "exterior", title: "Exterior" },
];

const createEmptyForm = () => ({
  title: "",
  description: "",
  location: "",
  latitude: "",
  longitude: "",
  price: "",
  image: "",
  tourSections: TOUR_AREAS.map((area) => ({
    ...area,
    panorama: "",
  })),
});

function HotelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hotels = useSelector(
    (state) => state.hotels?.hotels || []
  );

  const hotel = hotels.find(
    (item) => String(item.id) === String(id)
  );

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(createEmptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && hotel) {
      const savedTours = hotel.tourSections || [];

      setFormData({
        title: hotel.title || "",
        description: hotel.description || "",
        location: hotel.location || "",
        latitude: hotel.latitude ?? "",
        longitude: hotel.longitude ?? "",
        price: hotel.price ?? "",
        image: hotel.image || "",
        tourSections: TOUR_AREAS.map((area) => {
          const saved = savedTours.find(
            (section) => section.id === area.id
          );

          return {
            ...area,
            panorama: saved?.panorama || "",
          };
        }),
      });

      setImagePreview(hotel.image || "");
    } else if (!isEditing) {
      setFormData(createEmptyForm());
      setImagePreview("");
    }
  }, [hotel, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageData = reader.result;

      setFormData((previous) => ({
        ...previous,
        image: imageData,
      }));

      setImagePreview(imageData);
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const handleTourChange = (areaId, value) => {
    setFormData((previous) => ({
      ...previous,
      tourSections: previous.tourSections.map((section) =>
        section.id === areaId
          ? { ...section, panorama: value.trim() }
          : section
      ),
    }));
  };

  const isValidPanoramaUrl = (value) => {
    if (!value) return true;

    try {
      const url = new URL(value, window.location.origin);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const {
      title,
      description,
      location,
      latitude,
      longitude,
      price,
      tourSections,
    } = formData;

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      latitude === "" ||
      longitude === "" ||
      price === "" ||
      !formData.image
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hotelPrice = Number(price);

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    if (!Number.isFinite(hotelPrice) || hotelPrice <= 0) {
      setError("Please enter a valid hotel price.");
      return;
    }

    const invalidTour = tourSections.find(
      (section) => !isValidPanoramaUrl(section.panorama)
    );

    if (invalidTour) {
      setError(
        `Please enter a valid URL for ${invalidTour.title}.`
      );
      return;
    }

    const hotelData = {
      ...formData,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      latitude: lat,
      longitude: lng,
      price: hotelPrice,
      tourSections,
    };

    if (isEditing) {
      dispatch(
        updateHotel({
          id: hotel.id,
          ...hotelData,
        })
      );
    } else {
      dispatch(
        addHotel({
          id: Date.now().toString(),
          ...hotelData,
        })
      );
    }

    navigate("/hotels");
  };

  if (isEditing && !hotel) {
    return (
      <div className="hotel-not-found">
        <h2>Property not found</h2>
        <button onClick={() => navigate("/hotels")}>
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="form-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/hotels")}
      >
        <ArrowLeft size={17} />
        Back to Properties
      </button>

      <div className="page-heading">
        <span className="details-eyebrow">
          PROPERTY MANAGEMENT
        </span>

        <h1>{isEditing ? "Edit Property" : "Add New Property"}</h1>

        <p>
          {isEditing
            ? "Update your property details and virtual tours."
            : "Add a new hotel to your HAVENLY collection."}
        </p>
      </div>

      <form className="hotel-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Property Information</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Hotel Name *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="latitude">Latitude *</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="13.0827"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude *</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="80.2707"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price per Night (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="4500"
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Property Cover Image</h2>

          <label className="upload-area" htmlFor="image">
            <Upload size={28} />
            <strong>Upload Property Image</strong>
            <span>Choose an image (Maximum 2 MB)</span>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Hotel preview" />
            </div>
          )}
        </section>

        <section className="form-section">
          <h2>Complete 360° Virtual Tour</h2>

          <p className="tour-form-note">
            Add a separate 360° panorama image URL for each
            property area. Use genuine 2:1 equirectangular
            panorama images.
          </p>

          <div className="tour-form-sections">
            {formData.tourSections.map((section) => (
              <div
                className="tour-input-group"
                key={section.id}
              >
                <label htmlFor={`tour-${section.id}`}>
                  {section.title}
                </label>

                <input
                  id={`tour-${section.id}`}
                  type="text"
                  value={section.panorama}
                  onChange={(event) =>
                    handleTourChange(
                      section.id,
                      event.target.value
                    )
                  }
                  placeholder={`Enter ${section.title} panorama URL`}
                />
              </div>
            ))}
          </div>
        </section>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/hotels")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            <Save size={17} />
            {isEditing ? "Save Changes" : "Add Property"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HotelForm;
