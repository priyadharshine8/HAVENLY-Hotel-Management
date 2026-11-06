
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addHotel, updateHotel } from "../redux/hotelSlice";
import {
  ArrowLeft,
  Upload,
  Compass,
  Image as ImageIcon,
} from "lucide-react";

// Five virtual tour areas
const TOUR_AREAS = [
  { id: "lobby", title: "Lobby" },
  { id: "rooms", title: "Guest Rooms" },
  { id: "restaurant", title: "Restaurant" },
  { id: "pool", title: "Swimming Pool" },
  { id: "exterior", title: "Exterior" },
];

function HotelForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const hotels = useSelector((state) => state.hotels?.hotels || []);

  const existingHotel = hotels.find(
    (hotel) => String(hotel.id) === String(id)
  );

  // Initial form data
  const [form, setForm] = useState(() => ({
    title: existingHotel?.title || "",
    description: existingHotel?.description || "",
    location: existingHotel?.location || "",
    latitude: existingHotel?.latitude ?? "",
    longitude: existingHotel?.longitude ?? "",
    price: existingHotel?.price ?? "",
    image: existingHotel?.image || "",

    tourSections: TOUR_AREAS.map((area) => ({
      ...area,
      panorama:
        existingHotel?.tourSections?.find(
          (section) => section.id === area.id
        )?.panorama ||
        (area.id === "lobby" ? existingHotel?.tourImage || "" : ""),
    })),
  }));

  const [preview, setPreview] = useState(
    existingHotel?.image || ""
  );

  // Update normal form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Upload hotel cover image
  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageData = reader.result;

      setPreview(imageData);

      setForm((previous) => ({
        ...previous,
        image: imageData,
      }));
    };

    reader.readAsDataURL(file);
  };

  // Update individual 360 panorama URL
  const handleTourChange = (areaId, value) => {
    setForm((previous) => ({
      ...previous,
      tourSections: previous.tourSections.map((section) =>
        section.id === areaId
          ? { ...section, panorama: value }
          : section
      ),
    }));
  };

  // Validate and save hotel
  const handleSubmit = (e) => {
    e.preventDefault();

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const price = Number(form.price);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      alert("Please enter a valid latitude between -90 and 90.");
      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      alert("Please enter a valid longitude between -180 and 180.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert("Please enter a valid property price.");
      return;
    }

    // Validate panorama URLs
    for (const section of form.tourSections) {
      if (!section.panorama.trim()) continue;

      try {
        const url = new URL(section.panorama);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
          throw new Error("Invalid URL");
        }
      } catch {
        alert(`Please enter a valid URL for ${section.title}.`);
        return;
      }
    }

    const hotelData = {
      ...form,
      id: existingHotel
        ? existingHotel.id
        : Date.now().toString(),
      latitude,
      longitude,
      price,
      tourSections: form.tourSections.map((section) => ({
        ...section,
        panorama: section.panorama.trim(),
      })),
    };

    if (existingHotel) {
      dispatch(updateHotel(hotelData));
      alert("Property updated successfully!");
    } else {
      dispatch(addHotel(hotelData));
      alert("Property added successfully!");
    }

    navigate("/hotels");
  };

  return (
    <div className="form-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/hotels")}
      >
        <ArrowLeft size={17} />
        Back to properties
      </button>

      <div className="page-heading">
        <p className="eyebrow">PROPERTY MANAGEMENT</p>

        <h1>
          {existingHotel ? "Edit Property" : "Add New Property"}
        </h1>

        <p>Enter the details of your property below.</p>
      </div>

      <form className="hotel-form" onSubmit={handleSubmit}>
        {/* PROPERTY INFORMATION */}
        <div className="form-section">
          <h3>Property Information</h3>

          <label>Property Name</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter hotel name"
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your property"
            rows="4"
            required
          />

          <label>Location</label>

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="City, State"
            required
          />
        </div>

        {/* LOCATION DETAILS */}
        <div className="form-section">
          <h3>Location Coordinates</h3>

          <div className="form-grid">
            <div>
              <label>Latitude</label>

              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="13.0827"
                required
              />
            </div>

            <div>
              <label>Longitude</label>

              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="80.2707"
                required
              />
            </div>
          </div>

          <label>Price per Night (₹)</label>

          <input
            type="number"
            name="price"
            min="1"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            required
          />
        </div>

        {/* PROPERTY COVER IMAGE */}
        <div className="form-section">
          <h3>
            <ImageIcon size={19} />
            Property Cover Image
          </h3>

          <label className="upload-area">
            <Upload size={25} />

            <span>Click to upload property image</span>

            <small>JPG, PNG or WEBP · Maximum 2 MB</small>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              hidden
            />
          </label>

          {preview && (
            <img
              className="image-preview"
              src={preview}
              alt="Property preview"
            />
          )}
        </div>

        {/* MULTI-SECTION 360 VIRTUAL TOUR */}
        <div className="form-section">
          <h3>
            <Compass size={19} />
            Complete 360° Virtual Tour
          </h3>

          <p>
            Add separate 360° panoramic images to let visitors
            explore different areas of your hotel.
          </p>

          <div className="tour-form-sections">
            {form.tourSections.map((section, index) => (
              <div
                className="tour-input-group"
                key={section.id}
              >
                <div className="tour-input-heading">
                  <span className="tour-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <strong>{section.title}</strong>
                </div>

                <label>
                  {section.title} Panorama Image URL
                </label>

                <input
                  type="url"
                  value={section.panorama}
                  onChange={(e) =>
                    handleTourChange(
                      section.id,
                      e.target.value
                    )
                  }
                  placeholder={`Paste ${section.title} 360° image URL`}
                />

                <small>
                  Enter a hosted equirectangular 360° panorama URL.
                </small>
              </div>
            ))}
          </div>

          <div className="tour-form-note">
            <Compass size={18} />

            <p>
              Each section is optional. Add genuine 360° panorama
              images for the best virtual tour experience.
            </p>
          </div>
        </div>

        {/* FORM BUTTONS */}
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
            {existingHotel
              ? "Save Changes"
              : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HotelForm;
