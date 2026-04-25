import { create } from "zustand";



export interface CartSeat {
  seatId: string;
  row: string;
  number: number;
  type: string;
  price: number;
}

export interface MovieCartItem {
  type: "MOVIE";
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  showtimeId: string;
  showtime: string;
  theatreName: string;
  screenName: string;
  seats: CartSeat[];
  totalAmount: number;
}

export interface HotelCartItem {
  type: "HOTEL";
  hotelId: string;
  hotelName: string;
  imageUrl: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  guests: number;
  pricePerNight: number;
  totalAmount: number;
}

export type CartItem = MovieCartItem | HotelCartItem;

interface CartState {
  item: CartItem | null;
  bookingId: string | null;
  lockedUntil: string | null;
  setItem: (item: CartItem) => void;
  setBookingId: (id: string) => void;
  setLockedUntil: (time: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  item: null,
  bookingId: null,
  lockedUntil: null,
  setItem: (item) => set({ item }),
  setBookingId: (bookingId) => set({ bookingId }),
  setLockedUntil: (lockedUntil) => set({ lockedUntil }),
  clearCart: () => set({ item: null, bookingId: null, lockedUntil: null }),
}));



interface AuthState {
  user: { id: string; name: string; email: string; avatar?: string } | null;
  isLoading: boolean;
  setUser: (user: AuthState["user"]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
}));



interface SearchState {
  query: string;
  city: string;
  setQuery: (query: string) => void;
  setCity: (city: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  city: "",
  setQuery: (query) => set({ query }),
  setCity: (city) => set({ city }),
}));



interface LocationState {
  city: string;
  lat: number | null;
  lng: number | null;
  setCity: (city: string) => void;
  setCoords: (lat: number, lng: number) => void;
  openPicker: boolean;
  setOpenPicker: (open: boolean) => void;
  initCity: () => void;
}


export const useLocationStore = create<LocationState>((set) => ({
  city: "",
  lat: null,
  lng: null,
  openPicker: false,
  setCity: (city) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omnibook_city", city);
    }
    set({ city });
  },
  setCoords: (lat, lng) => set({ lat, lng }),
  setOpenPicker: (openPicker) => set({ openPicker }),
  initCity: () => {
    if (typeof window !== "undefined") {
      const city = localStorage.getItem("omnibook_city") || "";
      set({ city });
    }
  }
}));
