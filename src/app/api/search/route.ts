import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ movies: [], hotels: [], cities: [] });
    }

    const [movies, hotels, cities] = await Promise.all([
      prisma.movie.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { genre: { has: q } },
            { director: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          posterUrl: true,
          genre: true,
          rating: true,
          language: true,
        },
      }),
      prisma.hotel.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 5,
        include: {
          city: true,
          roomTypes: {
            orderBy: { pricePerNight: "asc" },
            take: 1,
          },
        },
      }),
      prisma.city.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ movies, hotels, cities });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
