import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: {
            startTime: { gte: startOfDay, lte: endOfDay },
            isActive: true,
          },
          include: {
            screen: {
              include: {
                theatre: {
                  include: { city: true },
                },
                seats: { orderBy: [{ row: "asc" }, { number: "asc" }] },
              },
            },
            seatStatuses: true,
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ movie });
  } catch {
    return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
  }
}
