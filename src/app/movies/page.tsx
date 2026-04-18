"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, Filter, Loader2 } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  rating: number;
  certificate: string;
  posterUrl: string | null;
  releaseDate: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const genres = ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Romance", "Horror", "Animation"];
const languages = ["Hindi", "English", "Tamil", "Telugu", "Malayalam"];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedLang) params.set("language", selectedLang);

    setLoading(true);
    fetch(`/api/movies?${params}`)
      .then((r) => r.json())
      .then((data) => setMovies(data.movies || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [selectedGenre, selectedLang]);

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Now Showing</h1>
          <p className="section-subtitle">Book tickets for the latest movies</p>
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
          className="card p-5 mb-8 space-y-4"
        >
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-3">Genre</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre("")}
                className={`chip text-xs ${!selectedGenre ? "chip-accent" : ""}`}
              >
                All
              </button>
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g === selectedGenre ? "" : g)}
                  className={`chip text-xs ${selectedGenre === g ? "chip-accent" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-3">Language</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLang("")}
                className={`chip text-xs ${!selectedLang ? "chip-accent" : ""}`}
              >
                All
              </button>
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLang(l === selectedLang ? "" : l)}
                  className={`chip text-xs ${selectedLang === l ? "chip-accent" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-zinc-500 text-lg">No movies found</p>
          <p className="text-zinc-600 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
          initial="hidden"
          animate="visible"
        >
          {movies.map((movie, i) => (
            <motion.div key={movie.id} variants={fadeUp} custom={i}>
              <Link href={`/movies/${movie.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 bg-zinc-800">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                      <span className="text-4xl font-bold text-zinc-600">
                        {movie.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-white">{movie.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="btn-primary text-xs w-full py-2">Book Now</span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>{movie.genre.slice(0, 2).join(", ")}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
