"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { formatCurrency, formatDate, formatTime, getStatusColor, getStatusBg } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Ticket,
  Hotel,
  Calendar,
  MapPin,
  Loader2,
  ChevronRight,
  LayoutDashboard,
  Clock,
  XCircle,
} from "lucide-react";

interface Booking {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  movieDetail?: {
    seats: { seat: { row: string; number: number; type: string }; price: number }[];
    showtime: {
      startTime: string;
      movie: { title: string; posterUrl: string | null };
      screen: { name: string; theatre: { name: string; city: { name: string } } };
    };
  };
  hotelDetail?: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    guests: number;
    roomType: {
      name: string;
      hotel: { name: string; imageUrl: string | null; city: { name: string } };
    };
  };
  payment?: {
    status: string;
    method: string;
    transactionId: string | null;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user, router]);

  const filtered =
    filter === "all"
      ? bookings
      : filter === "movies"
      ? bookings.filter((b) => b.type === "MOVIE")
      : filter === "hotels"
      ? bookings.filter((b) => b.type === "HOTEL")
      : bookings.filter((b) => b.status === filter.toUpperCase());

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    totalSpent: bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
        );
      }
    } catch {
      /* noop */
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-sm text-zinc-500">Manage your bookings and itinerary</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 !hover:transform-none">
          <p className="text-sm text-zinc-500 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-zinc-500 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.confirmed}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-zinc-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-zinc-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-indigo-400">{formatCurrency(stats.totalSpent)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "movies", "hotels", "confirmed", "pending", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip text-xs capitalize ${filter === f ? "chip-accent" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <LayoutDashboard size={40} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 mb-2">No bookings found</p>
          <p className="text-sm text-zinc-600">
            Start exploring movies and hotels to make your first booking!
          </p>
        </div>
      ) : (
        <motion.div className="space-y-4" initial="hidden" animate="visible">
          {filtered.map((booking, i) => (
            <motion.div key={booking.id} variants={fadeUp} custom={i} className="card p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    booking.type === "MOVIE" ? "bg-indigo-500/15" : "bg-emerald-500/15"
                  }`}
                >
                  {booking.type === "MOVIE" ? (
                    <Ticket size={20} className="text-indigo-400" />
                  ) : (
                    <Hotel size={20} className="text-emerald-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {booking.type === "MOVIE"
                          ? booking.movieDetail?.showtime.movie.title
                          : booking.hotelDetail?.roomType.hotel.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {booking.type === "MOVIE" ? "Movie Ticket" : "Hotel Reservation"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBg(booking.status)} ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-zinc-400">
                    {booking.type === "MOVIE" && booking.movieDetail && (
                      <>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(booking.movieDetail.showtime.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(booking.movieDetail.showtime.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {booking.movieDetail.showtime.screen.theatre.name}
                        </span>
                        <span>
                          Seats:{" "}
                          {booking.movieDetail.seats
                            .map((s) => `${s.seat.row}${s.seat.number}`)
                            .join(", ")}
                        </span>
                      </>
                    )}
                    {booking.type === "HOTEL" && booking.hotelDetail && (
                      <>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(booking.hotelDetail.checkIn)} → {formatDate(booking.hotelDetail.checkOut)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {booking.hotelDetail.roomType.hotel.city.name}
                        </span>
                        <span>{booking.hotelDetail.roomType.name} × {booking.hotelDetail.rooms}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-indigo-400">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                    <div className="flex gap-2">
                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn-ghost text-xs !px-3 !py-1.5 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      )}
                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => router.push(`/checkout/${booking.id}`)}
                          className="btn-primary text-xs !px-3 !py-1.5"
                        >
                          Complete Payment
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
