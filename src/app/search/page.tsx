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
    <div className="page-container py-10 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="section-title mb-2">Search Everything</h1>
        <p className="section-subtitle">Find movies, hotels, and cities in one place</p>
      </div>

      <div className="relative mb-8">
        <SearchIcon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "Avengers", "Mumbai", or "The Grand Hotel"...'
          className="input-field pl-12 py-4 text-base"
          autoFocus
        />
        {loading && (
          <Loader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-400"
          />
        )}
      </div>

      {searched && !loading && !hasResults && (
        <div className="text-center py-16">
          <SearchIcon size={40} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-zinc-600 mt-1">Try a different search term</p>
        </div>
      )}

      {results.cities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin size={14} />
            Cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {results.cities.map((city) => (
              <Link
                key={city.id}
                href={`/hotels?cityId=${city.id}`}
                className="chip hover:chip-accent transition-all"
              >
                {city.name}, {city.state}
                <ArrowRight size={10} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.movies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Ticket size={14} />
            Movies
          </h2>
          <motion.div className="space-y-3" initial="hidden" animate="visible">
            {results.movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/movies/${movie.id}`} className="card p-4 flex items-center gap-4 group block">
                  <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">
                        {movie.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span>{movie.genre.slice(0, 2).join(", ")}</span>
                      <span>{movie.language}</span>
                      <span className="flex items-center gap-1">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        {movie.rating}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {results.hotels.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Hotel size={14} />
            Hotels
          </h2>
          <motion.div className="space-y-3">
            {results.hotels.map((hotel, i) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/hotels/${hotel.id}`} className="card p-4 flex items-center gap-4 group block">
                  <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                    {hotel.imageUrl ? (
                      <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">
                        {hotel.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {hotel.city.name}
                    </p>
                  </div>
                  {hotel.roomTypes.length > 0 && (
                    <span className="text-sm font-semibold text-indigo-400">
                      {formatCurrency(hotel.roomTypes[0].pricePerNight)}
                      <span className="text-xs text-zinc-500 font-normal">/night</span>
                    </span>
                  )}
                  <ArrowRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
