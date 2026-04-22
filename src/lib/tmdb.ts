const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  adult: boolean;
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime: number;
  original_language: string;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}


export const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE}/${size}${path}`;
}

export function profileUrl(path: string | null, size: "w185" | "w342" = "w185"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); 
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getNowPlaying(page = 1, region = "IN") {
  return tmdbFetch<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(
    "/movie/now_playing",
    { page: page.toString(), region, language: "en-US" }
  );
}

export async function getPopular(page = 1, region = "IN") {
  return tmdbFetch<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(
    "/movie/popular",
    { page: page.toString(), region, language: "en-US" }
  );
}

export async function getUpcoming(page = 1, region = "IN") {
  return tmdbFetch<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(
    "/movie/upcoming",
    { page: page.toString(), region, language: "en-US" }
  );
}

export async function getMovieDetail(movieId: number) {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${movieId}`, { language: "en-US" });
}

export async function getMovieCredits(movieId: number) {
  return tmdbFetch<{ cast: TMDBCast[]; crew: TMDBCrew[] }>(`/movie/${movieId}/credits`);
}

export async function getMovieVideos(movieId: number) {
  return tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${movieId}/videos`);
}

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch<{ results: TMDBMovie[]; total_pages: number }>(
    "/search/movie",
    { query, page: page.toString(), language: "en-US" }
  );
}


export const LANG_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  bn: "Bengali",
  mr: "Marathi",
  pa: "Punjabi",
  ko: "Korean",
  ja: "Japanese",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  zh: "Chinese",
  pt: "Portuguese",
  ru: "Russian",
};

export function getLanguageName(code: string): string {
  return LANG_MAP[code] || code.toUpperCase();
}
