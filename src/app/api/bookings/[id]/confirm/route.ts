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
          include: { seats: true, showtime: true },
        },
        hotelDetail: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking is not in pending state" }, { status: 400 });
    }

    if (booking.lockedUntil && new Date(booking.lockedUntil) < new Date()) {
      return NextResponse.json({ error: "Booking has expired. Please start over." }, { status: 410 });
    }

    const confirmed = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          lockedUntil: null,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: id,
          amount: booking.totalAmount,
          status: "COMPLETED",
          method: "card",
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        },
      });

      if (booking.type === "MOVIE" && booking.movieDetail) {
        const seatIds = booking.movieDetail.seats.map((s: any) => s.seatId);
        for (const seatId of seatIds) {
          await tx.showtimeSeatStatus.upsert({
            where: {
              showtimeId_seatId: {
                showtimeId: booking.movieDetail.showtimeId,
                seatId,
              },
            },
            update: { status: "BOOKED", lockedBy: null, lockedAt: null },
            create: {
              showtimeId: booking.movieDetail.showtimeId,
              seatId,
              status: "BOOKED",
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ booking: confirmed });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}
