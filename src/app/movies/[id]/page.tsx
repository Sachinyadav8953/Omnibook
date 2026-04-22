"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  Clock,
  Calendar,
  Play,
  ArrowLeft,
  Users,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { DetailHeroSkeleton } from "@/components/SkeletonLoaders";
import BookingSection from "@/components/movies/BookingSection";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
}

interface TMDBMovieDetail {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  rating: number;
  voteCount: number;
  runtime: number;
  genres: string[];
  status: string;
  director: string;
  cast: CastMember[];
  trailerKey: string | null;
  productionCompanies: string[];
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tmdb/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setMovie(null);
        } else {
          setMovie(data.movie);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setMovie(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <DetailHeroSkeleton />
        <div className="page-container py-8 space-y-6">
          <div className="card p-6 animate-pulse space-y-3">
            <div className="skeleton-shimmer h-5 w-1/4 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-full rounded-lg" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-32 min-h-screen bg-[#fdfbf7]">
        <p className="text-zinc-500 text-lg">Movie not found</p>
        {errorMsg && <p className="text-red-400 text-sm mt-2 font-mono bg-red-50 p-2 max-w-lg mx-auto rounded-lg">Error: {errorMsg}</p>}
        <Link href="/movies" className="btn-secondary text-sm mt-4 inline-flex">
          <ArrowLeft size={16} /> Back to Movies
        </Link>
      </div>
    );
  }

  const formatRuntime = (min: number) => {
    if (!min) return "N/A";
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]"><div className="relative h-[450px] md:h-[550px] overflow-hidden -mt-16">
        {movie.backdropUrl ? (
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#183e29] to-[#0f281a]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/70 to-black/30" /><Link
          href="/movies"
          className="absolute top-20 left-4 md:left-8 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 text-sm hover:bg-black/50 transition-colors border border-white/10"
        >
          <ArrowLeft size={14} />
          Back
        </Link><div className="absolute bottom-0 left-0 right-0 page-container pb-8">
          <div className="flex items-end gap-6">
            {movie.posterUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:block w-40 h-60 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border-2 border-white/20"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {movie.tagline && (
                <p className="text-sm text-[#c4a962] italic mb-2 font-serif">&ldquo;{movie.tagline}&rdquo;</p>
              )}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {movie.genres.map((g) => (
                  <span key={g} className="chip text-xs !bg-white/90 !text-zinc-700">{g}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 text-zinc-900">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Star size={15} className="text-yellow-400 fill-yellow-400" />
                  {movie.rating}/10
                  <span className="text-zinc-400 text-xs font-normal">({movie.voteCount.toLocaleString()} votes)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatRuntime(movie.runtime)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(movie.releaseDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div><div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {}
            {movie.trailerKey && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <button
                  onClick={() => setShowTrailer(true)}
                  className="w-full card p-5 flex items-center gap-4 group hover:border-[#c4a962]/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#183e29] flex items-center justify-center flex-shrink-0 group-hover:bg-[#c4a962] transition-colors">
                    <Play size={22} className="text-white ml-0.5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Watch Trailer</p>
                    <p className="text-xs text-zinc-400">YouTube • Official Trailer</p>
                  </div>
                  <ExternalLink size={14} className="text-zinc-300 ml-auto" />
                </button>
              </motion.div>
            )}

            {}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8"
              id="booking-section"
            >
              <h2 className="font-serif font-bold text-2xl mb-6">Book Tickets</h2>
              <BookingSection movieId={id} movieTitle={movie.title} posterUrl={movie.posterUrl} />
            </motion.div><motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="font-serif font-semibold text-lg mb-3">Synopsis</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">{movie.overview}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Director:</span>{" "}
                  <span className="text-zinc-800 font-medium">{movie.director}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Status:</span>{" "}
                  <span className="text-zinc-800 font-medium">{movie.status}</span>
                </div>
              </div>
            </motion.div>

            {}
            {movie.cast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users size={18} className="text-[#c4a962]" />
                  Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {movie.cast.map((member, idx) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.03 }}
                      className="card p-3 flex items-center gap-3 !shadow-none hover:!shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#f0eee5]">
                        {member.profileUrl ? (
                          <img
                            src={member.profileUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-serif font-bold italic text-sm">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{member.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{member.character}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div><div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4"><motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h3 className="font-semibold mb-4">Movie Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Rating</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      {movie.rating}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Runtime</span>
                    <span className="font-medium">{formatRuntime(movie.runtime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Release Date</span>
                    <span className="font-medium text-xs">
                      {new Date(movie.releaseDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Director</span>
                    <span className="font-medium">{movie.director}</span>
                  </div>
                  {movie.productionCompanies.length > 0 && (
                    <div className="border-t border-zinc-100 pt-3">
                      <span className="text-zinc-400 text-xs">Production</span>
                      <p className="text-xs font-medium mt-1">
                        {movie.productionCompanies.slice(0, 3).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {}
              {movie.posterUrl && (
                <div className="md:hidden card overflow-hidden">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full rounded-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      {showTrailer && movie.trailerKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="autoplay"
              className="w-full h-full rounded-2xl"
            />
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
