"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setUser(data.user);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-zinc-500">Sign in to access your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
