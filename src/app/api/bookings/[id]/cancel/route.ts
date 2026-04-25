import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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
          include: { seats: true },
        },
        hotelDetail: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.booking.update({
        where: { id },
        data: { status: "CANCELLED", lockedUntil: null },
      });

      if (booking.type === "MOVIE" && booking.movieDetail) {
        for (const seat of booking.movieDetail.seats) {
          await tx.showtimeSeatStatus.updateMany({
            where: {
              showtimeId: booking.movieDetail.showtimeId,
              seatId: seat.seatId,
            },
            data: { status: "AVAILABLE", lockedBy: null, lockedAt: null },
          });
        }
      }

      if (booking.payment) {
        await tx.payment.update({
          where: { bookingId: id },
          data: { status: "REFUNDED" },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
