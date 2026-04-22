import Link from "next/link";
import { Ticket, Hotel, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#183e29] text-white relative overflow-hidden"><div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z\'/%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="page-container py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12"><div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <span className="font-serif text-2xl font-bold italic tracking-tight">
                Omni<span className="text-[#c4a962]">Book.</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed font-sans max-w-xs">
              The universal booking engine for those who seek extraordinary experiences. Curated travel and entertainment, all in one place.
            </p>
          </div><div>
            <h4 className="text-xs font-semibold mb-5 tracking-widest uppercase text-white/40">Entertainment</h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/movies" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group">
                  <Ticket size={13} className="text-white/30 group-hover:text-[#c4a962] transition-colors" />
                  Premium Cinema
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/30 flex items-center gap-2 cursor-not-allowed">
                  Events
                  <span className="text-[9px] uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded-md">Soon</span>
                </span>
              </li>
            </ul>
          </div><div>
            <h4 className="text-xs font-semibold mb-5 tracking-widest uppercase text-white/40">Travel</h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/hotels" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group">
                  <Hotel size={13} className="text-white/30 group-hover:text-[#c4a962] transition-colors" />
                  Luxury Hotels
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/30 flex items-center gap-2 cursor-not-allowed">
                  Flights
                  <span className="text-[9px] uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded-md">Soon</span>
                </span>
              </li>
            </ul>
          </div><div>
            <h4 className="text-xs font-semibold mb-5 tracking-widest uppercase text-white/40">Quick Links</h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors group flex items-center gap-1">
                  My Bookings
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-white/60 hover:text-white transition-colors group flex items-center gap-1">
                  Search Experiences
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div><div className="border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-sans">
            © {new Date().getFullYear()} OmniBook Platforms. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/30">
            <span className="hover:text-white/60 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
