"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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
  TrendingUp,
  CheckCircle2,
  CircleDashed,
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
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }
    if (!isLoaded || !user) return;

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
      ? bookings.filter((b: Booking) => b.type === "MOVIE")
      : filter === "hotels"
      ? bookings.filter((b: Booking) => b.type === "HOTEL")
      : bookings.filter((b: Booking) => b.status === filter.toUpperCase());

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b: Booking) => b.status === "CONFIRMED").length,
    pending: bookings.filter((b: Booking) => b.status === "PENDING").length,
    totalSpent: bookings
      .filter((b: Booking) => b.status === "CONFIRMED")
      .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0),
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b: Booking) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
        );
      }
    } catch {
      
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#c4a962]" />
        <p className="text-sm text-zinc-400">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen"><section className="border-b border-[var(--card-border)] bg-white">
        <div className="page-container py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#183e29] to-[#1a5035] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#183e29]/20">
              {user?.firstName?.charAt(0).toUpperCase() || user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif">Welcome back, {user?.firstName || user?.fullName}</h1>
              <p className="text-sm text-zinc-400 font-sans">Manage your bookings and itinerary</p>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container py-8 pb-20"><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 group hover:border-[#183e29]/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Total</p>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-[#183e29]/10 transition-colors">
                <LayoutDashboard size={14} className="text-zinc-400 group-hover:text-[#183e29] transition-colors" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="card p-5 group hover:border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Confirmed</p>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#183e29]">{stats.confirmed}</p>
          </div>
          <div className="card p-5 group hover:border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Pending</p>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <CircleDashed size={14} className="text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#c4a962]">{stats.pending}</p>
          </div>
          <div className="card p-5 group hover:border-[#183e29]/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Spent</p>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-[#183e29]/10 transition-colors">
                <TrendingUp size={14} className="text-zinc-400 group-hover:text-[#183e29] transition-colors" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#183e29]">{formatCurrency(stats.totalSpent)}</p>
          </div>
        </div><div className="flex flex-wrap gap-2 mb-6">
          {["all", "movies", "hotels", "confirmed", "pending", "cancelled"].map((f: string) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip text-xs capitalize ${filter === f ? "chip-accent" : ""}`}
            >
              {f === "movies" && <Ticket size={11} />}
              {f === "hotels" && <Hotel size={11} />}
              {f}
            </button>
          ))}
        </div>

        {}
        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-500 mb-1 font-medium">No bookings found</p>
            <p className="text-sm text-zinc-400">
              Start exploring movies and hotels to make your first booking!
            </p>
          </div>
        ) : (
          <motion.div className="space-y-3" initial="hidden" animate="visible">
            {filtered.map((booking: Booking, i: number) => (
              <motion.div key={booking.id} variants={fadeUp} custom={i} className="card p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4"><div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      booking.type === "MOVIE"
                        ? "bg-gradient-to-br from-[#183e29]/10 to-emerald-50"
                        : "bg-gradient-to-br from-[#c4a962]/10 to-amber-50"
                    }`}
                  >
                    {booking.type === "MOVIE" ? (
                      <Ticket size={20} className="text-[#183e29]" />
                    ) : (
                      <Hotel size={20} className="text-[#c4a962]" />
                    )}
                  </div><div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {booking.type === "MOVIE"
                            ? booking.movieDetail?.showtime.movie.title
                            : booking.hotelDetail?.roomType.hotel.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {booking.type === "MOVIE" ? "Movie Ticket" : "Hotel Reservation"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBg(booking.status)} ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div><div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-zinc-400">
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
                              .map((s: any) => `${s.seat.row}${s.seat.number}`)
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
                    </div><div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--card-border)]">
                      <span className="text-lg font-bold text-[#183e29]">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                      <div className="flex gap-2">
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn-ghost text-xs !px-3 !py-1.5 text-red-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        )}
                        {booking.status === "PENDING" && (
                          <button
                            onClick={() => router.push(`/checkout/${booking.id}`)}
                            className="btn-primary text-xs !px-4 !py-1.5"
                          >
                            Pay Now
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
    </div>
  );
}
