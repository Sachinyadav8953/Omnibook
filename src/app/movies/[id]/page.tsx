"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore, useAuthStore } from "@/store";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

interface SeatData {
  id: string;
  row: string;
  number: number;
  type: string;
}

interface SeatStatusData {
  seatId: string;
  status: string;
}

interface ShowtimeData {
  id: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  premiumPrice: number;
  vipPrice: number;
  screen: {
    id: string;
    name: string;
    rows: number;
    columns: number;
    seats: SeatData[];
    theatre: {
      name: string;
      address: string;
      city: { name: string };
    };
  };
  seatStatuses: SeatStatusData[];
}

interface MovieData {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  rating: number;
  certificate: string;
  posterUrl: string | null;
  bannerUrl: string | null;
  releaseDate: string;
  cast: string[];
  director: string;
  showtimes: ShowtimeData[];
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { setItem, setBookingId, setLockedUntil } = useCartStore();

  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([]);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/movies/${id}?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data.movie);
        setSelectedShowtime(null);
        setSelectedSeats([]);
      })
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [id, selectedDate]);

  const getSeatStatus = (seat: SeatData): string => {
    if (!selectedShowtime) return "AVAILABLE";
    const status = selectedShowtime.seatStatuses.find((s) => s.seatId === seat.id);
    if (status?.status === "BOOKED") return "BOOKED";
    if (status?.status === "LOCKED") return "LOCKED";
    return "AVAILABLE";
  };

  const getSeatPrice = (type: string): number => {
    if (!selectedShowtime) return 0;
    if (type === "PREMIUM") return selectedShowtime.premiumPrice;
    if (type === "VIP") return selectedShowtime.vipPrice;
    return selectedShowtime.basePrice;
  };

  const toggleSeat = (seat: SeatData) => {
    const status = getSeatStatus(seat);
    if (status !== "AVAILABLE") return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 10) return prev;
      return [...prev, seat];
    });
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + getSeatPrice(s.type), 0);

  const handleBooking = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (selectedSeats.length === 0 || !selectedShowtime) return;

    setBooking(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: selectedShowtime.id,
          seatIds: selectedSeats.map((s) => s.id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setItem({
        type: "MOVIE",
        movieId: movie!.id,
        movieTitle: movie!.title,
        posterUrl: movie!.posterUrl || "",
        showtimeId: selectedShowtime.id,
        showtime: selectedShowtime.startTime,
        theatreName: selectedShowtime.screen.theatre.name,
        screenName: selectedShowtime.screen.name,
        seats: selectedSeats.map((s) => ({
          seatId: s.id,
          row: s.row,
          number: s.number,
          type: s.type,
          price: getSeatPrice(s.type),
        })),
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

  if (!movie) {
    return (
      <div className="text-center py-32">
        <p className="text-zinc-500 text-lg">Movie not found</p>
      </div>
    );
  }

  const seatsByRow: Record<string, SeatData[]> = {};
  if (selectedShowtime) {
    for (const seat of selectedShowtime.screen.seats) {
      if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
      seatsByRow[seat.row].push(seat);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {movie.bannerUrl || movie.posterUrl ? (
          <img
            src={movie.bannerUrl || movie.posterUrl || ""}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 page-container pb-8">
          <div className="flex items-end gap-6">
            {movie.posterUrl && (
              <div className="hidden md:block w-36 h-52 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-zinc-700">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="chip text-xs">{movie.certificate}</span>
                <span className="chip text-xs">{movie.language}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {movie.rating}/10
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(movie.releaseDate)}
                </span>
                <span>{movie.genre.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card p-6">
              <h2 className="font-semibold mb-3">About the movie</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{movie.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Director:</span>{" "}
                  <span className="text-zinc-300">{movie.director}</span>
                </div>
                {movie.cast.length > 0 && (
                  <div>
                    <span className="text-zinc-500">Cast:</span>{" "}
                    <span className="text-zinc-300">{movie.cast.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Select Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === new Date().toISOString().split("T")[0];
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[72px] transition-all border ${
                        selectedDate === date
                          ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                          : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {isToday ? "Today" : d.toLocaleDateString("en", { weekday: "short" })}
                      </span>
                      <span className="text-lg font-bold">{d.getDate()}</span>
                      <span className="text-xs">{d.toLocaleDateString("en", { month: "short" })}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {movie.showtimes.length > 0 ? (
              <div>
                <h2 className="font-semibold mb-4">Select Showtime</h2>
                <div className="space-y-4">
                  {Object.entries(
                    movie.showtimes.reduce(
                      (acc, st) => {
                        const key = st.screen.theatre.name;
                        if (!acc[key]) acc[key] = { theatre: st.screen.theatre, showtimes: [] };
                        acc[key].showtimes.push(st);
                        return acc;
                      },
                      {} as Record<string, { theatre: ShowtimeData["screen"]["theatre"]; showtimes: ShowtimeData[] }>
                    )
                  ).map(([name, data]) => (
                    <div key={name} className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-sm">{name}</h3>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {data.theatre.address}, {data.theatre.city.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.showtimes.map((st) => (
                          <button
                            key={st.id}
                            onClick={() => {
                              setSelectedShowtime(st);
                              setSelectedSeats([]);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                              selectedShowtime?.id === st.id
                                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                            }`}
                          >
                            {formatTime(st.startTime)}
                          </button>
                        ))}
                      </div>
                      {data.showtimes.some((st) => selectedShowtime?.id === st.id) && (
                        <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                          <span>Regular: {formatCurrency(data.showtimes[0].basePrice)}</span>
                          <span>Premium: {formatCurrency(data.showtimes[0].premiumPrice)}</span>
                          <span>VIP: {formatCurrency(data.showtimes[0].vipPrice)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="text-zinc-500">No showtimes available for this date</p>
              </div>
            )}

            {selectedShowtime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-semibold mb-4">Select Seats</h2>

                <div className="card p-6">
                  <div className="flex justify-center mb-8">
                    <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full" />
                  </div>
                  <p className="text-center text-xs text-zinc-600 mb-6">SCREEN</p>

                  <div className="space-y-2 overflow-x-auto">
                    {Object.entries(seatsByRow).map(([row, seats]) => (
                      <div key={row} className="flex items-center gap-2 justify-center">
                        <span className="w-6 text-xs text-zinc-500 font-medium text-right">{row}</span>
                        <div className="flex gap-1.5">
                          {seats.map((seat) => {
                            const status = getSeatStatus(seat);
                            const isSelected = selectedSeats.some((s) => s.id === seat.id);
                            return (
                              <button
                                key={seat.id}
                                onClick={() => toggleSeat(seat)}
                                disabled={status !== "AVAILABLE"}
                                className={`seat ${
                                  isSelected
                                    ? "seat-selected"
                                    : status === "BOOKED"
                                    ? "seat-booked"
                                    : status === "LOCKED"
                                    ? "seat-locked"
                                    : `seat-available ${seat.type === "PREMIUM" ? "seat-premium" : seat.type === "VIP" ? "seat-vip" : ""}`
                                }`}
                                title={`${row}${seat.number} - ${seat.type} - ${formatCurrency(getSeatPrice(seat.type))}`}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                        </div>
                        <span className="w-6 text-xs text-zinc-500 font-medium">{row}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-8 text-xs text-zinc-500">
                    <span className="flex items-center gap-2">
                      <div className="seat seat-available !w-5 !h-5 !cursor-default" /> Available
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="seat seat-selected !w-5 !h-5 !cursor-default" /> Selected
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="seat seat-booked !w-5 !h-5 !cursor-default" /> Booked
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="seat seat-locked !w-5 !h-5 !cursor-default" /> Locked
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {selectedShowtime && selectedSeats.length > 0 && (
                <motion.div
                  className="card p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="font-semibold mb-4">Booking Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Movie</span>
                      <span className="text-zinc-200 font-medium">{movie.title}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Date</span>
                      <span className="text-zinc-200">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Time</span>
                      <span className="text-zinc-200">{formatTime(selectedShowtime.startTime)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Theatre</span>
                      <span className="text-zinc-200 text-right text-xs">
                        {selectedShowtime.screen.theatre.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Screen</span>
                      <span className="text-zinc-200">{selectedShowtime.screen.name}</span>
                    </div>

                    <div className="border-t border-zinc-800 pt-3">
                      <p className="text-zinc-400 mb-2">Seats ({selectedSeats.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSeats.map((s) => (
                          <span key={s.id} className="chip text-xs">
                            {s.row}{s.number}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-3 space-y-1">
                      {selectedSeats.map((s) => (
                        <div key={s.id} className="flex justify-between text-xs text-zinc-500">
                          <span>{s.row}{s.number} ({s.type})</span>
                          <span>{formatCurrency(getSeatPrice(s.type))}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-800 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-indigo-400 text-lg">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300 flex items-start gap-2">
                    <Info size={14} className="flex-shrink-0 mt-0.5" />
                    Seats will be held for 10 minutes during checkout
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={booking}
                    className="btn-primary w-full mt-4 py-3"
                  >
                    {booking ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                    {booking ? "Locking seats..." : `Pay ${formatCurrency(totalAmount)}`}
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
