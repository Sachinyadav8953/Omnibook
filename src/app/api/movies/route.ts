import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const genre = searchParams.get("genre");
    const language = searchParams.get("language");

    const where: Record<string, unknown> = { isActive: true };
    if (genre) where.genre = { has: genre };
    if (language) where.language = language;

    const movies = await prisma.movie.findMany({
      where,
      include: {
        showtimes: {
          where: {
            startTime: { gte: new Date() },
            isActive: true,
            ...(cityId ? { screen: { theatre: { cityId } } } : {}),
          },
          include: {
            screen: {
              include: {
                theatre: {
                  include: { city: true },
                },
              },
            },
          },
          orderBy: { startTime: "asc" },
          take: 5,
        },
      },
      orderBy: { releaseDate: "desc" },
    });

    return NextResponse.json({ movies });
  } catch {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
