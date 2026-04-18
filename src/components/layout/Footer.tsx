import Link from "next/link";
import { Ticket, Hotel } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#183e29] text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-serif text-2xl font-bold italic tracking-tight">
                Omni<span className="text-[#c4a962]">Book.</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed font-sans">
              The universal booking engine for those who seek extraordinary experiences. Curated travel and entertainment.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wider uppercase text-white/90">Entertainment</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/movies" className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Ticket size={14} />
                  Premium Cinema
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/50 flex items-center gap-2 cursor-not-allowed">
                  Events (Soon)
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wider uppercase text-white/90">Travel</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/hotels" className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Hotel size={14} />
                  Luxury Hotels
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/50 flex items-center gap-2 cursor-not-allowed">
                  Flights (Soon)
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wider uppercase text-white/90">Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-white/70 hover:text-white transition-colors">
                  Search Experiences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-16 pt-8 flex items-center justify-between">
          <p className="text-sm text-white/50 font-sans">
            © {new Date().getFullYear()} OmniBook Platforms. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-white/50">
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
