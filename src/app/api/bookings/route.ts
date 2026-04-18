import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.userId },
      include: {
        movieDetail: {
          include: {
            seats: { include: { seat: true } },
            showtime: {
              include: {
                movie: true,
                screen: {
                  include: { theatre: { include: { city: true } } },
                },
              },
            },
          },
        },
        hotelDetail: {
          include: {
            roomType: {
              include: {
                hotel: { include: { city: true } },
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
