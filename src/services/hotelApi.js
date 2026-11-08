
import axios from "axios";

// Local development and live deployment API URLs
const API_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://havenly-hotel-management.onrender.com/api";

const API_ORIGIN = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://havenly-hotel-management.onrender.com";

const hotelApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// GET - Fetch all hotels
export const getHotels = async () => {
  const response = await hotelApi.get("/hotels");
  return response.data;
};

// POST - Add hotel
export const createHotel = async (hotel) => {
  const response = await hotelApi.post("/hotels", hotel);
  return response.data;
};

// PUT - Update hotel
export const editHotel = async (id, hotel) => {
  const response = await hotelApi.put(`/hotels/${id}`, hotel);
  return response.data;
};

// DELETE - Delete hotel
export const removeHotel = async (id) => {
  const response = await hotelApi.delete(`/hotels/${id}`);
  return response.data;
};

// POST - Upload image to Supabase
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(
    `${API_URL}/upload`,
    formData
  );

  return response.data;
};

// Convert server image path into browser URL
export const getImageUrl = (image) => {
  if (image && image.startsWith("/uploads/")) {
    return `${API_ORIGIN}${image}`;
  }

  return image;
};
