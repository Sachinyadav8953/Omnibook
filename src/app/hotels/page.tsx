"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Star, MapPin, Wifi, Car, Coffee, Loader2, Filter } from "lucide-react";

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
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} />,
  Parking: <Car size={12} />,
  Restaurant: <Coffee size={12} />,
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (minRating > 0) params.set("rating", minRating.toString());

    setLoading(true);
    fetch(`/api/hotels?${params}`)
      .then((r) => r.json())
      .then((data) => setHotels(data.hotels || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, [minRating]);

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Hotels</h1>
          <p className="section-subtitle">Find the perfect stay for your trip</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary text-sm"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card p-5 mb-8"
        >
          <p className="text-sm font-medium text-zinc-400 mb-3">Minimum Star Rating</p>
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
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-zinc-500 text-lg">No hotels found</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
        >
          {hotels.map((hotel, i) => (
            <motion.div key={hotel.id} variants={fadeUp} custom={i}>
              <Link href={`/hotels/${hotel.id}`} className="block group">
                <div className="card overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    {hotel.imageUrl ? (
                      <img
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
                        <span className="text-4xl font-bold text-zinc-600">
                          {hotel.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                      {Array.from({ length: hotel.starRating }).map((_, idx) => (
                        <Star key={idx} size={10} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-400 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mb-3">
                      <MapPin size={10} />
                      {hotel.city.name}, {hotel.city.state}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hotel.amenities.slice(0, 4).map((a) => (
                        <span key={a} className="chip text-xs flex items-center gap-1">
                          {amenityIcons[a] || null}
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hotel.avgRating > 0 && (
                          <span className="flex items-center gap-1 text-sm">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{hotel.avgRating}</span>
                            <span className="text-zinc-500 text-xs">
                              ({hotel.reviewCount})
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-400">
                          {formatCurrency(hotel.startingPrice)}
                        </p>
                        <p className="text-xs text-zinc-500">per night</p>
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
  );
}
