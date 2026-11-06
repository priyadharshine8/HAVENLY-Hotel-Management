
import { createSlice } from "@reduxjs/toolkit";

const TOUR_AREAS = [
  { id: "lobby", title: "Lobby", panorama: "" },
  { id: "rooms", title: "Guest Rooms", panorama: "" },
  { id: "restaurant", title: "Restaurant", panorama: "" },
  { id: "pool", title: "Swimming Pool", panorama: "" },
  { id: "exterior", title: "Exterior", panorama: "" },
];

const demoHotels = [
  {
    id: "1",
    title: "The Grand Palace",
    location: "Chennai",
    description: "A premium city stay with elegant rooms and modern facilities.",
    latitude: 13.0827,
    longitude: 80.2707,
    price: 4500,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
    reviews: [], 
    tourSections: TOUR_AREAS.map((section) => ({ ...section })),
  },
  {
    id: "2",
    title: "Ocean Breeze Resort",
    location: "Pondicherry",
    description: "A relaxing coastal retreat for a peaceful getaway.",
    latitude: 11.9416,
    longitude: 79.8083,
    price: 3800,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900",
    reviews: [],
    tourSections: TOUR_AREAS.map((section) => ({ ...section })),
  },
  {
    id: "3",
    title: "Green Valley Retreat",
    location: "Ooty",
    description: "A scenic retreat surrounded by beautiful green landscapes.",
    latitude: 11.4102,
    longitude: 76.695,
    price: 5200,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900",
    reviews: [],
    tourSections: TOUR_AREAS.map((section) => ({ ...section })),
  },
];

const STORAGE_KEY = "havenlyHotels";
const WISHLIST_KEY = "havenlyWishlist";

function loadHotels() {
  try {
    const savedHotels = localStorage.getItem(STORAGE_KEY);

    if (savedHotels) {
      const parsedHotels = JSON.parse(savedHotels);

      if (Array.isArray(parsedHotels)) {
        return parsedHotels.map((hotel) => ({
          ...hotel,
          reviews: Array.isArray(hotel.reviews) ? hotel.reviews : [],
          tourSections: TOUR_AREAS.map((area) => ({
            ...area,
            ...(hotel.tourSections?.find(
              (section) => section.id === area.id
            ) || {}),
            panorama:
              hotel.tourSections?.find(
                (section) => section.id === area.id
              )?.panorama ||
              (area.id === "lobby" ? hotel.tourImage || "" : ""),
          })),
        }));
      }
    }
  } catch (error) {
    console.error("Could not load saved hotels:", error);
  }

  return demoHotels;
}

function loadWishlist() {
  try {
    const savedWishlist = localStorage.getItem(WISHLIST_KEY);

    if (savedWishlist) {
      const parsedWishlist = JSON.parse(savedWishlist);
      return Array.isArray(parsedWishlist) ? parsedWishlist : [];
    }
  } catch (error) {
    console.error("Could not load wishlist:", error);
  }

  return [];
}

const initialState = {
  hotels: loadHotels(),
  wishlistIds: loadWishlist(),
};

const saveHotels = (hotels) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  } catch (error) {
    console.error("Could not save hotels:", error);
  }
};

const saveWishlist = (wishlistIds) => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  } catch (error) {
    console.error("Could not save wishlist:", error);
  }
};

const hotelSlice = createSlice({
  name: "hotels",
  initialState,

  reducers: {
    addHotel: (state, action) => {
      state.hotels.push({
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
      });

      saveHotels(state.hotels);
    },

    updateHotel: (state, action) => {
      const index = state.hotels.findIndex(
        (hotel) => hotel.id === action.payload.id
      );

      if (index !== -1) {
        state.hotels[index] = {
          ...state.hotels[index],
          ...action.payload,
        };

        saveHotels(state.hotels);
      }
    },

    deleteHotel: (state, action) => {
      state.hotels = state.hotels.filter(
        (hotel) => hotel.id !== action.payload
      );

      state.wishlistIds = state.wishlistIds.filter(
        (id) => id !== action.payload
      );

      saveHotels(state.hotels);
      saveWishlist(state.wishlistIds);
    },
    addReview: (state, action) => {
      const { hotelId, review } = action.payload;

      const hotel = state.hotels.find(
        (item) => item.id === hotelId
      );

      if (hotel) {
        if (!Array.isArray(hotel.reviews)) {
          hotel.reviews = [];
        }

        hotel.reviews.push(review);

        saveHotels(state.hotels);
      }
    },
    toggleWishlist: (state, action) => {
      const hotelId = action.payload;

      if (state.wishlistIds.includes(hotelId)) {
        state.wishlistIds = state.wishlistIds.filter(
          (id) => id !== hotelId
        );
      } else {
        state.wishlistIds.push(hotelId);
      }

      saveWishlist(state.wishlistIds);
    },

    resetHotels: (state) => {
      state.hotels = demoHotels.map((hotel) => ({
        ...hotel,
        tourSections: hotel.tourSections.map((section) => ({
          ...section,
        })),
      }));

      state.wishlistIds = [];

      saveHotels(state.hotels);
      saveWishlist(state.wishlistIds);
    },
  },
});

export const {
  addHotel,
  updateHotel,
  deleteHotel,
  resetHotels,
  toggleWishlist,
  addReview,
} = hotelSlice.actions;

export default hotelSlice.reducer;
