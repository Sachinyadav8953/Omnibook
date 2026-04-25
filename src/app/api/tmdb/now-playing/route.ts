import { NextRequest, NextResponse } from "next/server";
import {
  getNowPlaying,
  getPopular,
  getUpcoming,
  searchMovies,
  posterUrl,
  backdropUrl,
  TMDB_GENRES,
  getLanguageName,
} from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "now_playing"; 
    const page = parseInt(searchParams.get("page") || "1");
    const genre = searchParams.get("genre"); 
    const language = searchParams.get("language"); 
    const sortBy = searchParams.get("sort"); 
    const query = searchParams.get("query");

    let data;
    if (query) {
      data = await searchMovies(query, page);
    } else {
      switch (category) {
        case "popular":
          data = await getPopular(page);
          break;
        case "upcoming":
          data = await getUpcoming(page);
          break;
        default:
          data = await getNowPlaying(page);
      }
    }

    
    let movies = data.results
      .filter((m) => m.poster_path) 
      .map((m) => ({
        id: m.id,
        title: m.title,
        overview: m.overview,
        posterUrl: posterUrl(m.poster_path, "w500"),
        backdropUrl: backdropUrl(m.backdrop_path),
        releaseDate: m.release_date,
        rating: Math.round(m.vote_average * 10) / 10,
        voteCount: m.vote_count,
        genres: m.genre_ids.map((gid) => TMDB_GENRES[gid] || "Other").filter(Boolean),
        language: getLanguageName(m.original_language),
        languageCode: m.original_language,
        popularity: m.popularity,
      }));

    
    if (genre) {
      movies = movies.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (language) {
      movies = movies.filter((m) => m.languageCode === language);
    }

    
    if (sortBy === "rating") {
      movies.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "release") {
      movies.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    }
    

    return NextResponse.json({
      movies,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      page,
    });
  } catch (error) {
    console.error("TMDB API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies from TMDB", movies: [] },
      { status: 500 }
    );
  }
}
