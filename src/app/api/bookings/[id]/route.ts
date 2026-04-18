import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        movieDetail: {
          include: {
            seats: {
              include: { seat: true },
            },
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
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}
