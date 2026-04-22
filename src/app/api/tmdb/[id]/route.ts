import { NextRequest, NextResponse } from "next/server";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieVideos,
  posterUrl,
  backdropUrl,
  profileUrl,
} from "@/lib/tmdb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const [detail, credits, videos] = await Promise.all([
      getMovieDetail(movieId),
      getMovieCredits(movieId).catch(() => ({ cast: [], crew: [] })),
      getMovieVideos(movieId).catch(() => ({ results: [] })),
    ]);

    const director = (credits.crew || []).find((c) => c.job === "Director");
    const trailer = (videos.results || []).find(
      (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );

    const movie = {
      id: detail.id,
      title: detail.title,
      tagline: detail.tagline,
      overview: detail.overview,
      posterUrl: posterUrl(detail.poster_path, "w780"),
      backdropUrl: backdropUrl(detail.backdrop_path, "original"),
      releaseDate: detail.release_date,
      rating: Math.round(detail.vote_average * 10) / 10,
      voteCount: detail.vote_count,
      runtime: detail.runtime,
      genres: (detail.genres || []).map((g) => g.name),
      status: detail.status,
      director: director?.name || "Unknown",
      cast: (credits.cast || []).slice(0, 12).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: profileUrl(c.profile_path),
      })),
      trailerKey: trailer?.key || null,
      productionCompanies: (detail.production_companies || []).map((p) => p.name),
    };

    return NextResponse.json({ movie });
  } catch (error) {
    console.error("TMDB movie detail error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
