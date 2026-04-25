"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocationStore } from "@/store";
import { Menu, X, LogOut, LayoutDashboard, Ticket, Hotel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const initCity = useLocationStore((state) => state.initCity);
  const isHome = pathname === "/";

  useEffect(() => {
    initCity();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [initCity]);
  const navClass = isHome && !scrolled
    ? "bg-transparent text-white border-transparent"
    : scrolled
      ? "bg-white/80 backdrop-blur-md text-[#183e29] shadow-sm border-white/20"
      : "bg-[#183e29] text-white shadow-md border-[#122e1f]";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${navClass}`}
      >
        <div className="page-container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold italic tracking-tight">
              Omni<span className="text-[#c4a962]">Book.</span>
            </span>
          </Link><div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/movies" className="hover:text-[#c4a962] transition-colors">Movies</Link>
            <Link href="/hotels" className="hover:text-[#c4a962] transition-colors">Hotels</Link>
            <Link href="/destinations" className="hover:text-[#c4a962] transition-colors">Destinations</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-[#c4a962] transition-colors flex items-center gap-1">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="h-4 w-px bg-white/20"></div>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium hover:text-[#c4a962] transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-white !text-sm !px-5 !py-2">
                    Create Account
                  </button>
                </SignUpButton>
              </>
            )}
          </div><button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 text-current"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav><AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white text-[#1c1c1c] z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <span className="font-serif text-2xl font-bold italic">
                  Omni<span className="text-[#c4a962]">Book.</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:text-zinc-800">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col p-6 gap-6">
                <Link onClick={() => setMobileMenuOpen(false)} href="/movies" className="flex items-center gap-3 text-lg font-medium text-zinc-700 hover:text-[#183e29]">
                  <Ticket size={20} className="text-zinc-400" />
                  Movies
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/hotels" className="flex items-center gap-3 text-lg font-medium text-zinc-700 hover:text-[#183e29]">
                  <Hotel size={20} className="text-zinc-400" />
                  Hotels
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/destinations" className="flex items-center gap-3 text-lg font-medium text-zinc-700 hover:text-[#183e29]">
                  <span className="w-5 flex justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></span>
                  Destinations
                </Link>
              </div>

              <div className="mt-auto p-6 border-t border-zinc-100 bg-zinc-50/50">
                {isSignedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <UserButton />
                      <div>
                        <p className="font-medium">My Account</p>
                      </div>
                    </div>
                    <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard" className="btn-secondary w-full">
                      Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <SignInButton mode="modal">
                      <button onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center">
                        Create Account
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
