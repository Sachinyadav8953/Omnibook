"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  Search as SearchIcon,
  Ticket,
  Hotel,
  MapPin,
  Star,
  Loader2,
  ArrowRight,
  Compass,
} from "lucide-react";

interface SearchResults {
  movies: {
    id: string;
    title: string;
    posterUrl: string | null;
    genre: string[];
    rating: number;
    language: string;
  }[];
  hotels: {
    id: string;
    name: string;
    imageUrl: string | null;
    city: { name: string; state: string };
    roomTypes: { pricePerNight: number }[];
  }[];
  cities: {
    id: string;
    name: string;
    state: string;
  }[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ movies: [], hotels: [], cities: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ movies: [], hotels: [], cities: [] });
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ movies: [], hotels: [], cities: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timeout);
  }, [query, doSearch]);

  const hasResults =
    results.movies.length > 0 || results.hotels.length > 0 || results.cities.length > 0;

  return (
    <div className="bg-[#fdfbf7] min-h-screen"><section className="-mt-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2500&auto=format&fit=crop"
            alt="Explore destinations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#fdfbf7]" />
        </div>
        <div className="relative z-10 page-container pt-36 pb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Compass size={20} className="text-[#c4a962]" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white italic mb-3">Discover</h1>
            <p className="text-lg text-white/70 max-w-lg mx-auto font-sans">
              Search movies, hotels, and cities — all in one place.
            </p>
          </motion.div>
        </div>
      </section><div className="page-container max-w-3xl mx-auto pb-20"><motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative mb-10 -mt-6"
        >
          <div className="relative">
            <SearchIcon
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "Avengers", "Mumbai", or "The Grand Hotel"...'
              className="w-full rounded-2xl border border-[var(--card-border)] bg-white pl-14 pr-14 py-4.5 text-base text-[var(--foreground)] outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-lg shadow-black/5 font-sans"
              autoFocus
            />
            {loading && (
              <Loader2
                size={18}
                className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-[#c4a962]"
              />
            )}
          </div>
        </motion.div>

        {}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto mb-5">
              <SearchIcon size={32} className="text-zinc-300" />
            </div>
            <p className="text-zinc-400 text-sm">Start typing to search across all categories</p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <Link href="/movies" className="chip text-xs hover:bg-[var(--primary)] hover:text-white transition-all">
                <Ticket size={12} /> Movies
              </Link>
              <Link href="/hotels" className="chip text-xs hover:bg-[var(--primary)] hover:text-white transition-all">
                <Hotel size={12} /> Hotels
              </Link>
            </div>
          </motion.div>
        )}

        {}
        {searched && !loading && !hasResults && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-500 font-medium">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-zinc-400 mt-1">Try a different search term</p>
          </div>
        )}

        {}
        {results.cities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin size={13} />
              Cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {results.cities.map((city: any) => (
                <Link
                  key={city.id}
                  href={`/hotels?cityId=${city.id}`}
                  className="chip hover:bg-[var(--primary)] hover:text-white transition-all flex items-center gap-1.5"
                >
                  {city.name}, {city.state}
                  <ArrowRight size={10} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {}
        {results.movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Ticket size={13} />
              Movies
            </h2>
            <div className="space-y-2.5">
              {results.movies.map((movie: any, i: any) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/movies/${movie.id}`} className="card p-4 flex items-center gap-4 group block">
                    <div className="w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#f0eee5]">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 font-serif font-bold italic text-lg">
                          {movie.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-[#183e29] transition-colors truncate">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>{movie.genre.slice(0, 2).join(", ")}</span>
                        <span>{movie.language}</span>
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          {movie.rating}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-[#183e29] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {}
        {results.hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Hotel size={13} />
              Hotels
            </h2>
            <div className="space-y-2.5">
              {results.hotels.map((hotel: any, i: any) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/hotels/${hotel.id}`} className="card p-4 flex items-center gap-4 group block">
                    <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#f0eee5]">
                      {hotel.imageUrl ? (
                        <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 font-serif font-bold italic text-lg">
                          {hotel.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-[#183e29] transition-colors truncate">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {hotel.city.name}, {hotel.city.state}
                      </p>
                    </div>
                    {hotel.roomTypes.length > 0 && (
                      <span className="text-sm font-semibold text-[#183e29] flex-shrink-0">
                        {formatCurrency(hotel.roomTypes[0].pricePerNight)}
                        <span className="text-[10px] text-zinc-400 font-normal">/night</span>
                      </span>
                    )}
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-[#183e29] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
