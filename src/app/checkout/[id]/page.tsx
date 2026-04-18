"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Clock,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Ticket,
  Hotel,
  ArrowLeft,
  X,
} from "lucide-react";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { item, lockedUntil, clearCart } = useCartStore();

  const [timeLeft, setTimeLeft] = useState(600);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState<"pending" | "confirmed" | "expired" | "cancelled">("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lockedUntil) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(lockedUntil).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setStatus("expired");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerColor =
    timeLeft > 300
      ? "text-emerald-400"
      : timeLeft > 120
      ? "text-amber-400"
      : "text-red-400";

  const timerBg =
    timeLeft > 300
      ? "bg-emerald-500/10 border-emerald-500/20"
      : timeLeft > 120
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-red-500/10 border-red-500/20";

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${id}/confirm`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        if (res.status === 410) setStatus("expired");
        return;
      }

      setStatus("confirmed");
      clearCart();
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setConfirming(false);
    }
  }, [id, clearCart]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      setStatus("cancelled");
      clearCart();
    } catch {
      setError("Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (status === "confirmed") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          className="card p-10 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-zinc-400 mb-6">
            Your booking has been confirmed. Check your dashboard for details.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/dashboard")} className="btn-primary">
              View My Bookings
            </button>
            <button onClick={() => router.push("/")} className="btn-secondary">
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          className="card p-10 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Session Expired</h1>
          <p className="text-zinc-400 mb-6">
            Your 10-minute reservation window has expired. The seats/rooms have been released.
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Start Over
          </button>
        </motion.div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          className="card p-10 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-zinc-500/15 flex items-center justify-center mx-auto mb-6">
            <X size={32} className="text-zinc-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Cancelled</h1>
          <p className="text-zinc-400 mb-6">Your reservation has been cancelled and inventory released.</p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container py-10 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="btn-ghost text-sm mb-6">
        <ArrowLeft size={16} />
        Go back
      </button>

      <div className={`rounded-2xl border p-4 mb-6 flex items-center justify-between ${timerBg}`}>
        <div className="flex items-center gap-3">
          <Clock size={20} className={timerColor} />
          <div>
            <p className={`font-semibold ${timerColor}`}>
              {formatCountdown(timeLeft)} remaining
            </p>
            <p className="text-xs text-zinc-500">
              Complete your payment before time runs out
            </p>
          </div>
        </div>
        <div className={`text-3xl font-mono font-bold ${timerColor}`}>
          {formatCountdown(timeLeft)}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

      {item && (
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              {item.type === "MOVIE" ? (
                <Ticket size={20} className="text-indigo-400" />
              ) : (
                <Hotel size={20} className="text-emerald-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                {item.type === "MOVIE" ? "Movie Ticket" : "Hotel Reservation"}
              </p>

              {item.type === "MOVIE" && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{item.movieTitle}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Theatre:</span>{" "}
                      {item.theatreName}
                    </div>
                    <div>
                      <span className="text-zinc-500">Screen:</span>{" "}
                      {item.screenName}
                    </div>
                    <div>
                      <span className="text-zinc-500">Date:</span>{" "}
                      {formatDate(item.showtime)}
                    </div>
                    <div>
                      <span className="text-zinc-500">Time:</span>{" "}
                      {formatTime(item.showtime)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.seats.map((s) => (
                      <span key={s.seatId} className="chip text-xs">
                        {s.row}{s.number} ({s.type}) - {formatCurrency(s.price)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.type === "HOTEL" && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{item.hotelName}</h3>
                  <p className="text-sm text-zinc-400">{item.roomTypeName}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Check-in:</span>{" "}
                      {formatDate(item.checkIn)}
                    </div>
                    <div>
                      <span className="text-zinc-500">Check-out:</span>{" "}
                      {formatDate(item.checkOut)}
                    </div>
                    <div>
                      <span className="text-zinc-500">Nights:</span> {item.nights}
                    </div>
                    <div>
                      <span className="text-zinc-500">Rooms:</span> {item.rooms}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-5 pt-4 flex justify-between items-center">
            <span className="text-zinc-400">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-400">
              {formatCurrency(item.totalAmount)}
            </span>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-indigo-400" />
          Payment Method
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 cursor-pointer">
            <input type="radio" name="payment" defaultChecked className="accent-indigo-500" />
            <CreditCard size={18} className="text-zinc-400" />
            <div>
              <p className="text-sm font-medium">Credit / Debit Card</p>
              <p className="text-xs text-zinc-500">Mock payment — no real charge</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-700 cursor-pointer hover:border-zinc-600 transition">
            <input type="radio" name="payment" className="accent-indigo-500" />
            <Shield size={18} className="text-zinc-400" />
            <div>
              <p className="text-sm font-medium">UPI</p>
              <p className="text-xs text-zinc-500">Pay via UPI (simulated)</p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={confirming || timeLeft === 0}
          className="btn-primary flex-1 py-3 text-base"
        >
          {confirming ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Shield size={20} />
          )}
          {confirming ? "Processing Payment..." : `Pay ${item ? formatCurrency(item.totalAmount) : ""}`}
        </button>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="btn-danger py-3 px-6"
        >
          {cancelling ? <Loader2 size={18} className="animate-spin" /> : "Cancel"}
        </button>
      </div>
    </div>
  );
}
