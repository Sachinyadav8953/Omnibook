"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Filter, Ticket, X, TrendingUp, Clapperboard, CalendarDays, MapPin, ArrowUpDown } from "lucide-react";
import { useLocationStore } from "@/store";
import { MovieGridSkeleton } from "@/components/SkeletonLoaders";

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  rating: number;
  voteCount: number;
  genres: string[];
  language: string;
  languageCode: string;
  popularity: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War",
];

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
];

const SORT_OPTIONS = [
  { value: "", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "release", label: "Newest" },
];

const CATEGORY_TABS = [
  { value: "now_playing", label: "Now Playing", icon: <Clapperboard size={14} /> },
  { value: "popular", label: "Popular", icon: <TrendingUp size={14} /> },
  { value: "upcoming", label: "Upcoming", icon: <CalendarDays size={14} /> },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("now_playing");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { city, setOpenPicker } = useLocationStore();

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("category", category);
      if (selectedGenre) params.set("genre", selectedGenre);
      if (selectedLang) params.set("language", selectedLang);
      if (sortBy) params.set("sort", sortBy);

      const res = await fetch(`/api/tmdb/now-playing?${params}`);
      const data = await res.json();
      setMovies(data.movies || []);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [category, selectedGenre, selectedLang, sortBy]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const activeFilterCount = (selectedGenre ? 1 : 0) + (selectedLang ? 1 : 0) + (sortBy ? 1 : 0);

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedLang("");
    setSortBy("");
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen"><section className="-mt-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2500&auto=format&fit=crop"
            alt="Cinema experience"
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
                <Ticket size={20} className="text-[#c4a962]" />
              </div>
              <span className="text-sm font-medium text-white/70 uppercase tracking-widest">Premium Cinema</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white italic mb-3">Now Showing</h1>
            <div className="flex items-center gap-3">
              <p className="text-lg text-white/70 max-w-xl font-sans">
                Real-time movies powered by TMDB.
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
      </section><div className="page-container pb-20"><div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                category === tab.value
                  ? "bg-[#183e29] text-white shadow-md"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div><div className="flex items-center justify-between mb-8">
          <p className="text-sm text-zinc-500 font-sans">
            {loading ? "Loading movies..." : `${movies.length} movie${movies.length !== 1 ? "s" : ""} found`}
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
                  <p className="text-xs font-medium text-zinc-400 mb-2.5 uppercase tracking-wider">Genre</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedGenre("")}
                      className={`chip text-xs ${!selectedGenre ? "chip-accent" : ""}`}
                    >
                      All
                    </button>
                    {GENRE_OPTIONS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGenre(g === selectedGenre ? "" : g)}
                        className={`chip text-xs ${selectedGenre === g ? "chip-accent" : ""}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div><div>
                  <p className="text-xs font-medium text-zinc-400 mb-2.5 uppercase tracking-wider">Language</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedLang("")}
                      className={`chip text-xs ${!selectedLang ? "chip-accent" : ""}`}
                    >
                      All
                    </button>
                    {LANGUAGE_OPTIONS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setSelectedLang(l.code === selectedLang ? "" : l.code)}
                        className={`chip text-xs ${selectedLang === l.code ? "chip-accent" : ""}`}
                      >
                        {l.name}
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
          <MovieGridSkeleton count={10} />
        ) : movies.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Ticket size={28} className="text-zinc-300" />
            </div>
            <p className="text-zinc-500 text-lg font-medium">No movies found</p>
            <p className="text-zinc-400 text-sm mt-1">Try adjusting your filters or check back later</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="btn-secondary text-sm mt-4">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            initial="hidden"
            animate="visible"
          >
            {movies.map((movie, i) => (
              <motion.div key={movie.id} variants={fadeUp} custom={i}>
                <Link href={`/movies/${movie.id}`} className="group block">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 bg-[#f0eee5] shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#183e29]/10 to-[#183e29]/5">
                        <span className="text-5xl font-serif font-bold text-[#183e29]/20 italic">
                          {movie.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" /><div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-white">{movie.rating}</span>
                    </div><div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-zinc-700 backdrop-blur-sm">
                        {movie.language}
                      </span>
                    </div><div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <span className="btn-primary text-xs w-full py-2.5">View Details</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-[#183e29] transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="line-clamp-1">{movie.genres.slice(0, 2).join(", ")}</span>
                    {movie.releaseDate && (
                      <>
                        <span className="text-zinc-300">•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} />
                          {new Date(movie.releaseDate).getFullYear()}
                        </span>
                      </>
                    )}
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
