"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore, useAuthStore } from "@/store";
import { formatCurrency, getDaysBetween } from "@/lib/utils";
import {
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Wind,
  Tv,
  Bath,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar,
  Minus,
  Plus,
} from "lucide-react";

interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  totalRooms: number;
  maxGuests: number;
  amenities: string[];
  imageUrl: string | null;
  availableRooms?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

interface HotelData {
  id: string;
  name: string;
  address: string;
  description: string;
  starRating: number;
  amenities: string[];
  imageUrl: string | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  city: { name: string; state: string };
  roomTypes: RoomType[];
  reviews: Review[];
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={16} />,
  Parking: <Car size={16} />,
  Restaurant: <Coffee size={16} />,
  Gym: <Dumbbell size={16} />,
  AC: <Wind size={16} />,
  TV: <Tv size={16} />,
  "Hot Water": <Bath size={16} />,
};

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { setItem, setBookingId, setLockedUntil } = useCartStore();

  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/hotels/${id}?checkIn=${checkIn}&checkOut=${checkOut}`)
      .then((r) => r.json())
      .then((data) => {
        setHotel(data.hotel);
        setSelectedRoom(null);
      })
      .catch(() => setHotel(null))
      .finally(() => setLoading(false));
  }, [id, checkIn, checkOut]);

  const nights = getDaysBetween(checkIn, checkOut);
  const totalAmount = selectedRoom ? selectedRoom.pricePerNight * nights * rooms : 0;

  const handleBooking = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!selectedRoom) return;

    setBooking(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: selectedRoom.id,
          checkIn,
          checkOut,
          rooms,
          guests,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setItem({
        type: "HOTEL",
        hotelId: hotel!.id,
        hotelName: hotel!.name,
        imageUrl: hotel!.imageUrl || "",
        roomTypeId: selectedRoom.id,
        roomTypeName: selectedRoom.name,
        checkIn,
        checkOut,
        nights,
        rooms,
        guests,
        pricePerNight: selectedRoom.pricePerNight,
        totalAmount,
      });
      setBookingId(data.booking.id);
      setLockedUntil(data.lockedUntil);

      router.push(`/checkout/${data.booking.id}`);
    } catch {
      setError("Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-32">
        <p className="text-zinc-500 text-lg">Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {hotel.imageUrl ? (
          <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-teal-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 page-container pb-8">
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-zinc-400 flex items-center gap-2 text-sm">
            <MapPin size={14} />
            {hotel.address}, {hotel.city.name}, {hotel.city.state}
          </p>
          {hotel.avgRating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 text-sm font-semibold">
                {hotel.avgRating}
              </span>
              <span className="text-sm text-zinc-400">
                ({hotel.reviewCount} review{hotel.reviewCount !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card p-6">
              <h2 className="font-semibold mb-3">About</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 text-sm text-zinc-400">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-indigo-400">
                      {amenityIcons[a] || <Star size={14} />}
                    </div>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Select Dates</h2>
              <div className="card p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Check-in</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="date"
                        value={checkIn}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Check-out</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  {nights} night{nights !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.roomTypes.map((rt) => (
                  <motion.div
                    key={rt.id}
                    className={`card p-5 cursor-pointer transition-all ${
                      selectedRoom?.id === rt.id
                        ? "!border-indigo-500/50 !bg-indigo-500/5"
                        : ""
                    }`}
                    onClick={() => setSelectedRoom(rt)}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {rt.imageUrl && (
                        <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={rt.imageUrl} alt={rt.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{rt.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1">{rt.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-indigo-400">
                              {formatCurrency(rt.pricePerNight)}
                            </p>
                            <p className="text-xs text-zinc-500">per night</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Users size={12} />
                            Max {rt.maxGuests} guests
                          </span>
                          {rt.availableRooms !== undefined && (
                            <span className={`text-xs font-medium ${rt.availableRooms > 3 ? "text-emerald-400" : rt.availableRooms > 0 ? "text-amber-400" : "text-red-400"}`}>
                              {rt.availableRooms > 0
                                ? `${rt.availableRooms} available`
                                : "Sold out"}
                            </span>
                          )}
                        </div>
                        {rt.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {rt.amenities.slice(0, 5).map((a) => (
                              <span key={a} className="chip text-xs">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {hotel.reviews.length > 0 && (
              <div>
                <h2 className="font-semibold mb-4">Reviews</h2>
                <div className="space-y-3">
                  {hotel.reviews.map((review) => (
                    <div key={review.id} className="card p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.user.name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-zinc-400">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {selectedRoom && (
                <motion.div
                  className="card p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="font-semibold mb-4">Booking Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Hotel</span>
                      <span className="text-zinc-200 font-medium text-right text-xs max-w-[150px]">
                        {hotel.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Room</span>
                      <span className="text-zinc-200">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Check-in</span>
                      <span className="text-zinc-200">{checkIn}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Check-out</span>
                      <span className="text-zinc-200">{checkOut}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Nights</span>
                      <span className="text-zinc-200">{nights}</span>
                    </div>

                    <div className="border-t border-zinc-800 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-400">Rooms</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{rooms}</span>
                          <button
                            onClick={() =>
                              setRooms(
                                Math.min(selectedRoom.availableRooms || selectedRoom.totalRooms, rooms + 1)
                              )
                            }
                            className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Guests</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{guests}</span>
                          <button
                            onClick={() =>
                              setGuests(Math.min(selectedRoom.maxGuests * rooms, guests + 1))
                            }
                            className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-3 space-y-1">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>
                          {formatCurrency(selectedRoom.pricePerNight)} x {nights} night{nights > 1 ? "s" : ""} x {rooms} room{rooms > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-indigo-400 text-lg">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={booking || (selectedRoom.availableRooms !== undefined && selectedRoom.availableRooms < rooms)}
                    className="btn-primary w-full mt-4 py-3"
                  >
                    {booking ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                    {booking ? "Reserving..." : `Reserve for ${formatCurrency(totalAmount)}`}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
