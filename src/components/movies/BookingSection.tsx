"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, MonitorPlay, ArrowRight, Loader2, Navigation, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store";

interface Seat {
  id: string;
  row: string;
  number: number;
  type: "REGULAR" | "PREMIUM" | "VIP";
}

interface Showtime {
  id: string;
  startTime: string;
  basePrice: number;
  premiumPrice: number;
  vipPrice: number;
  screen: {
    id: string;
    name: string;
    theatre: {
      id: string;
      name: string;
      address: string;
      city?: string;
    };
    seats: Seat[];
  };
  seatStatuses: { seatId: string; status: "AVAILABLE" | "BOOKED" | "LOCKED" }[];
}

export default function BookingSection({ movieId, movieTitle, posterUrl }: { movieId: string, movieTitle: string, posterUrl: string | null }) {
  const router = useRouter();
  const { setItem } = useCartStore();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<"asking" | "granted" | "denied" | "unavailable">("asking");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Step 1: Try to get user location
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unavailable");
      fetchShowtimes();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("granted");
        fetchShowtimes(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocationStatus("denied");
        fetchShowtimes();
      },
      { timeout: 5000 }
    );
  }, [movieId]);

  function fetchShowtimes(lat?: number, lng?: number) {
    let url = `/api/movies/tmdb/${movieId}/showtimes`;
    if (lat !== undefined && lng !== undefined) {
      url += `?lat=${lat}&lng=${lng}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.showtimes && data.showtimes.length > 0) {
          setShowtimes(data.showtimes);
          const dates = Array.from(new Set(data.showtimes.map((st: Showtime) => format(new Date(st.startTime), 'yyyy-MM-dd'))));
          if (dates.length > 0) setSelectedDate(dates[0] as string);
        }
      })
      .catch(err => console.error("Failed to fetch showtimes:", err))
      .finally(() => setLoading(false));
  }

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 10) return;
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0 || !selectedShowtime) return;
    setBookingLoading(true);

    try {
      // Call the booking API to mark seats as booked
      const bookRes = await fetch("/api/bookings/cinema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: selectedShowtime.id,
          seatIds: selectedSeats,
        }),
      });

      const bookData = await bookRes.json();

      if (!bookRes.ok) {
        alert(bookData.error || "Booking failed. Some seats may already be taken.");
        setBookingLoading(false);
        return;
      }

      // Build cart item
      const seatDetails = selectedSeats
        .map(id => selectedShowtime.screen.seats.find(s => s.id === id)!)
        .filter(Boolean);

      let total = 0;
      const cartSeats = seatDetails.map(seat => {
        let price = selectedShowtime.basePrice;
        if (seat.type === "PREMIUM") price = selectedShowtime.premiumPrice;
        if (seat.type === "VIP") price = selectedShowtime.vipPrice;
        total += price;
        return { seatId: seat.id, row: seat.row, number: seat.number, type: seat.type, price };
      });

      setItem({
        type: "MOVIE",
        movieId,
        movieTitle,
        posterUrl: posterUrl || "",
        showtimeId: selectedShowtime.id,
        showtime: selectedShowtime.startTime,
        theatreName: selectedShowtime.screen.theatre.name,
        screenName: selectedShowtime.screen.name,
        seats: cartSeats,
        totalAmount: total,
      });

      // Show success state briefly, then update seat statuses in local state
      setBookingSuccess(true);

      // Update local showtime data to mark seats as booked
      setShowtimes(prev => prev.map(st => {
        if (st.id === selectedShowtime.id) {
          return {
            ...st,
            seatStatuses: [
              ...st.seatStatuses,
              ...selectedSeats.map(seatId => ({ seatId, status: "BOOKED" as const })),
            ],
          };
        }
        return st;
      }));

      setSelectedSeats([]);

      setTimeout(() => {
        setBookingSuccess(false);
        setBookingLoading(false);
      }, 2000);
    } catch {
      alert("Something went wrong. Please try again.");
      setBookingLoading(false);
    }
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center animate-pulse gap-3">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-[#c4a962] rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">
          {locationStatus === "asking" ? "Detecting your location..." : "Loading showtimes from 150 cinemas..."}
        </p>
      </div>
    );
  }

  if (showtimes.length === 0) {
    return (
      <div className="card p-8 text-center bg-zinc-50">
        <MonitorPlay size={32} className="mx-auto mb-3 text-zinc-300" />
        <p className="font-medium text-zinc-600">No Showtimes Available</p>
        <p className="text-sm text-zinc-400 mt-1">This movie might not be playing in nearby cinemas.</p>
      </div>
    );
  }

  const availableDates = Array.from(new Set(showtimes.map(st => format(new Date(st.startTime), 'yyyy-MM-dd')))).sort();
  const dateShowtimes = showtimes.filter(st => format(new Date(st.startTime), 'yyyy-MM-dd') === selectedDate);
  const selectedShowtime = showtimes.find(st => st.id === selectedShowtimeId);

  let rows: Record<string, Seat[]> = {};
  if (selectedShowtime) {
    rows = selectedShowtime.screen.seats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {} as Record<string, Seat[]>);
  }

  return (
    <div className="space-y-6">
      {/* Location badge */}
      {locationStatus === "granted" && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 w-fit">
          <Navigation size={12} className="text-emerald-500" />
          Showing cinemas nearest to you
        </div>
      )}

      {/* Date picker */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {availableDates.map(date => {
          const d = new Date(date);
          const isSelected = selectedDate === date;
          return (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); setSelectedShowtimeId(""); setSelectedSeats([]); }}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-[72px] rounded-2xl border transition-all ${
                isSelected
                  ? "bg-[#183e29] border-[#183e29] text-white shadow-md shadow-[#183e29]/20"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-white/70" : "text-zinc-400"}`}>
                {format(d, 'MMM')}
              </span>
              <span className="text-xl font-bold font-serif leading-none mt-1">
                {format(d, 'dd')}
              </span>
              <span className={`text-[10px] uppercase tracking-wider mt-1 ${isSelected ? "text-white/70" : "text-zinc-400"}`}>
                {format(d, 'EEE')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Theatre list or Seat map */}
      <AnimatePresence mode="popLayout">
        {!selectedShowtimeId ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {Array.from(new Set(dateShowtimes.map(st => st.screen.theatre.id))).map(theatreId => {
              const theatreShowtimes = dateShowtimes.filter(st => st.screen.theatre.id === theatreId);
              const theatre = theatreShowtimes[0].screen.theatre;

              return (
                <div key={theatreId} className="card p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">{theatre.name}</h4>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {theatre.address}
                      </p>
                    </div>
                    {theatre.city && (
                      <span className="text-[10px] font-semibold text-[#183e29] bg-[#183e29]/5 px-2 py-1 rounded-lg">
                        {theatre.city}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {theatreShowtimes.map(st => {
                      const timeStr = format(new Date(st.startTime), 'hh:mm a');
                      return (
                        <button
                          key={st.id}
                          onClick={() => setSelectedShowtimeId(st.id)}
                          className="flex flex-col border border-zinc-200 rounded-xl px-4 py-2 hover:border-[#183e29] hover:bg-[#183e29]/5 transition-all"
                        >
                          <span className="text-sm font-bold text-zinc-800">{timeStr}</span>
                          <span className="text-[10px] text-zinc-500">{st.screen.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : selectedShowtime ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 border-2 border-[#183e29]/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="font-bold">{selectedShowtime.screen.theatre.name}</h3>
                <p className="text-xs text-zinc-500">
                  {format(new Date(selectedShowtime.startTime), 'EEE, dd MMM')} • {format(new Date(selectedShowtime.startTime), 'hh:mm a')} • {selectedShowtime.screen.name}
                </p>
              </div>
              <button
                onClick={() => { setSelectedShowtimeId(""); setSelectedSeats([]); }}
                className="text-xs font-semibold text-[#183e29] bg-[#183e29]/5 px-3 py-1.5 rounded-lg hover:bg-[#183e29]/10 transition-colors"
              >
                Change Time
              </button>
            </div>

            {/* Screen indicator */}
            <div className="relative mb-12">
              <div className="h-6 w-3/4 mx-auto border-t-4 border-[#c4a962]/40 rounded-[100%] shadow-[0_-10px_20px_-5px_rgba(196,169,98,0.2)]" />
              <p className="text-center text-[10px] font-bold text-zinc-400 tracking-[0.3em] uppercase mt-2">All Eyes This Way</p>
            </div>

            {/* Seat map */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-max mx-auto space-y-2">
                {Object.keys(rows).sort().map(rowStr => (
                  <div key={rowStr} className="flex items-center gap-4 justify-center">
                    <span className="w-4 text-xs font-bold text-zinc-400 text-right">{rowStr}</span>
                    <div className="flex gap-1.5">
                      {rows[rowStr].map(seat => {
                        const statusObj = selectedShowtime.seatStatuses.find(s => s.seatId === seat.id);
                        const isUnavailable = statusObj && (statusObj.status === "BOOKED" || statusObj.status === "LOCKED");
                        const isSelected = selectedSeats.includes(seat.id);

                        // GREEN for available, RED for booked
                        let seatClasses = "";

                        if (isSelected) {
                          seatClasses = "bg-[#183e29] border-[#183e29] text-white shadow-lg shadow-[#183e29]/30 scale-110 ring-2 ring-[#183e29]/20";
                        } else if (isUnavailable) {
                          // RED — booked seats
                          seatClasses = "bg-red-100 border-red-300 text-red-400 cursor-not-allowed";
                        } else {
                          // GREEN — available seats (different shades for types)
                          if (seat.type === "VIP") {
                            seatClasses = "bg-emerald-100 border-emerald-400 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-500 hover:shadow-md";
                          } else if (seat.type === "PREMIUM") {
                            seatClasses = "bg-green-50 border-green-300 text-green-600 hover:bg-green-100 hover:border-green-400 hover:shadow-md";
                          } else {
                            seatClasses = "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm";
                          }
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={isUnavailable}
                            onClick={() => toggleSeat(seat.id)}
                            title={`${seat.row}${seat.number} — ${seat.type}${isUnavailable ? " (Booked)" : ""}`}
                            className={`w-8 h-8 rounded-t-lg rounded-b-sm border text-[10px] font-bold transition-all duration-150 flex items-center justify-center ${seatClasses}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-4 text-xs font-bold text-zinc-400">{rowStr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-8 pt-5 border-t border-zinc-100 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-700">
                <div className="w-5 h-5 rounded-sm border-2 bg-emerald-50 border-emerald-300" /> Available (Green)
              </div>
              <div className="flex items-center gap-2 font-semibold text-red-600">
                <div className="w-5 h-5 rounded-sm border-2 bg-red-100 border-red-300" /> Booked (Red)
              </div>
              <div className="flex items-center gap-2 font-semibold text-zinc-700">
                <div className="w-5 h-5 rounded-sm border-2 bg-[#183e29] border-[#183e29]" /> Your Selection
              </div>
              <div className="flex items-center gap-2 font-medium text-zinc-500">
                <span className="text-[10px] border border-zinc-200 rounded px-1.5 py-0.5">A-F</span> Regular ₹{selectedShowtime.basePrice}
              </div>
              <div className="flex items-center gap-2 font-medium text-zinc-500">
                <span className="text-[10px] border border-green-300 rounded px-1.5 py-0.5 bg-green-50">G-H</span> Premium ₹{selectedShowtime.premiumPrice}
              </div>
              <div className="flex items-center gap-2 font-medium text-zinc-500">
                <span className="text-[10px] border border-emerald-400 rounded px-1.5 py-0.5 bg-emerald-100">I-J</span> VIP ₹{selectedShowtime.vipPrice}
              </div>
            </div>

            {/* Booking success toast */}
            <AnimatePresence>
              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl"
                >
                  <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Seats Booked Successfully!</p>
                    <p className="text-xs text-emerald-600">Your seats are now reserved. They will appear red for other users.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkout bar */}
            <AnimatePresence>
              {selectedSeats.length > 0 && !bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-200"
                >
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-0.5">
                      {selectedSeats.length} seat{selectedSeats.length !== 1 && 's'} selected
                    </p>
                    <p className="text-xl font-bold text-[#183e29]">
                      ₹{selectedSeats.map(id => {
                        const s = selectedShowtime.screen.seats.find(x => x.id === id);
                        if (s?.type === 'VIP') return selectedShowtime.vipPrice;
                        if (s?.type === 'PREMIUM') return selectedShowtime.premiumPrice;
                        return selectedShowtime.basePrice;
                      }).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading}
                    className="btn-primary py-3 px-6 shadow-xl shadow-[#183e29]/20 flex items-center gap-2"
                  >
                    {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>Book Now <ArrowRight size={16} /></>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
