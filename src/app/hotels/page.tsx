"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Filter,
  Hotel as HotelIcon,
  X,
  ArrowUpDown,
  Search,
  Dumbbell,
  Waves,
  UtensilsCrossed,
  Coffee,
} from "lucide-react";
import { useLocationStore } from "@/store";
import { HotelGridSkeleton } from "@/components/SkeletonLoaders";

interface Hotel {
  id: string;
  name: string;
  address: string;
  description: string;
  starRating: number;
  amenities: string[];
  imageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  startingPrice: number;
  city: { id: string; name: string; state: string };
  roomTypes: { id: string; name: string; pricePerNight: number }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} />,
  Parking: <Car size={12} />,
  Restaurant: <Coffee size={12} />,
  Gym: <Dumbbell size={12} />,
  Pool: <Waves size={12} />,
  "Room Service": <UtensilsCrossed size={12} />,
};

const PRICE_RANGES = [
  { value: "", label: "Any Price" },
  { value: "0-3000", label: "Under ₹3,000" },
  { value: "3000-7000", label: "₹3K – ₹7K" },
  { value: "7000-15000", label: "₹7K – ₹15K" },
  { value: "15000-99999", label: "₹15K+" },
];

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_low", label: "Price: Low→High" },
  { value: "price_high", label: "Price: High→Low" },
  { value: "rating", label: "Top Rated" },
];

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("");
  const { city, setCity, setOpenPicker } = useLocationStore();
  const [searchInput, setSearchInput] = useState(city || "");

  useEffect(() => {
    setSearchInput(city || "");
  }, [city]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== city) {
        setCity(searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, city, setCity]);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city && city !== "Worldwide") {
        params.set("query", city);
      } else {
         params.set("query", "London"); 
      }
      
      if (minRating > 0) params.set("rating", minRating.toString());
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      }

      const res = await fetch(`/api/hotels/rapid?${params}`);
      const data = await res.json();
      let results: Hotel[] = data.hotels || [];

      
      if (sortBy === "price_low") {
        results.sort((a, b) => a.startingPrice - b.startingPrice);
      } else if (sortBy === "price_high") {
        results.sort((a, b) => b.startingPrice - a.startingPrice);
      } else if (sortBy === "rating") {
        results.sort((a, b) => b.avgRating - a.avgRating);
      }

      
      if (city) {
        const cityMatches = results.filter((h) =>
          h.city.name.toLowerCase().includes(city.toLowerCase())
        );
        
        if (cityMatches.length > 0) {
          const rest = results.filter(
            (h) => !h.city.name.toLowerCase().includes(city.toLowerCase())
          );
          results = [...cityMatches, ...rest];
        }
      }

      setHotels(results);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [minRating, priceRange, sortBy, city]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const activeFilterCount = (minRating > 0 ? 1 : 0) + (priceRange ? 1 : 0) + (sortBy ? 1 : 0);

  const clearFilters = () => {
    setMinRating(0);
    setPriceRange("");
    setSortBy("");
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen"><section className="-mt-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2500&auto=format&fit=crop"
            alt="Luxury hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#fdfbf7]" />
        </div>
        <div className="relative z-10 page-container pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <HotelIcon size={20} className="text-[#c4a962]" />
              </div>
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Curated Stays</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white italic mb-3">Luxury Hotels</h1>
            <div className="flex items-center gap-3">
              <p className="text-lg text-white/70 max-w-xl font-sans">
                Handpicked properties with world-class amenities.
              </p>
              {city && (
                <button
                  onClick={() => setOpenPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm hover:bg-white/20 transition-colors border border-white/10"
                >
                  <MapPin size={13} className="text-[#c4a962]" />
                  {city}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      
      <div className="page-container pb-20">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search hotels by city name (e.g., London, Dubai, Mumbai)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#183e29] focus:border-transparent transition-all shadow-sm placeholder:text-zinc-400"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-zinc-500 font-sans">
            {loading
              ? "Finding the best stays..."
              : `${hotels.length} propert${hotels.length !== 1 ? "ies" : "y"} available${city ? ` near ${city}` : ""}`}
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary text-sm !py-2 !px-4 ${showFilters ? "!bg-[var(--primary)] !text-white" : ""}`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#c4a962] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div><AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="card p-6 mb-8 space-y-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">Refine Results</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div><div>
                  <p className="text-xs font-medium text-zinc-400 mb-2.5 uppercase tracking-wider">Minimum Star Rating</p>
                  <div className="flex gap-2">
                    {[0, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`chip text-xs ${minRating === r ? "chip-accent" : ""}`}
                      >
                        {r === 0 ? "All" : `${r}+ Stars`}
                      </button>
                    ))}
                  </div>
                </div><div>
                  <p className="text-xs font-medium text-zinc-400 mb-2.5 uppercase tracking-wider">Price Range</p>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriceRange(p.value === priceRange ? "" : p.value)}
                        className={`chip text-xs ${priceRange === p.value ? "chip-accent" : ""}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div><div>
                  <p className="text-xs font-medium text-zinc-400 mb-2.5 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpDown size={11} /> Sort By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSortBy(s.value === sortBy ? "" : s.value)}
                        className={`chip text-xs ${sortBy === s.value ? "chip-accent" : ""}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        {loading ? (
          <HotelGridSkeleton count={6} />
        ) : hotels.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <HotelIcon size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-500 text-lg font-medium">No hotels found</p>
            <p className="text-zinc-400 text-sm mt-1">Try adjusting your filters or check back later</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="btn-secondary text-sm mt-4">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
            initial="hidden"
            animate="visible"
          >
            {hotels.map((hotel, i) => (
              <motion.div key={hotel.id} variants={fadeUp} custom={i}>
                <Link href={`/hotels/${hotel.id}`} className="block group">
                  <div className="card overflow-hidden h-full"><div className="relative h-52 overflow-hidden">
                      {hotel.imageUrl ? (
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#183e29]/10 to-[#183e29]/5 flex items-center justify-center">
                          <span className="text-5xl font-serif font-bold text-[#183e29]/20 italic">
                            {hotel.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {}
                      <div className="absolute top-3 right-3 flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                        {Array.from({ length: hotel.starRating }).map((_, idx) => (
                          <Star key={idx} size={10} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      {}
                      {city && hotel.city.name.toLowerCase().includes(city.toLowerCase()) && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#c4a962] text-white text-[10px] font-bold">
                          Near You
                        </div>
                      )}
                      {}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div><div className="p-5">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-[#183e29] transition-colors leading-tight">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mb-3">
                        <MapPin size={10} />
                        {hotel.city.name}, {hotel.city.state}
                      </p><div className="flex flex-wrap gap-1.5 mb-4">
                        {hotel.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="chip text-[10px] flex items-center gap-1 !px-2 !py-0.5">
                            {amenityIcons[a] || null}
                            {a}
                          </span>
                        ))}
                      </div><div className="flex items-end justify-between pt-3 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-2">
                          {hotel.avgRating > 0 && (
                            <span className="flex items-center gap-1 text-sm">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span className="font-medium">{hotel.avgRating}</span>
                              <span className="text-zinc-400 text-xs">
                                ({hotel.reviewCount})
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#183e29]">
                            {formatCurrency(hotel.startingPrice)}
                          </p>
                          <p className="text-[10px] text-zinc-400">per night</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
