import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        lockedUntil: { lt: new Date() },
        createdAt: { lt: tenMinutesAgo },
      },
      include: {
        movieDetail: {
          include: { seats: true },
        },
        hotelDetail: true,
      },
    });

    let expiredCount = 0;

    for (const booking of expiredBookings) {
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "EXPIRED" },
        });

        if (booking.type === "MOVIE" && booking.movieDetail) {
          for (const seat of booking.movieDetail.seats) {
            await tx.showtimeSeatStatus.updateMany({
              where: {
                showtimeId: booking.movieDetail.showtimeId,
                seatId: seat.seatId,
                status: "LOCKED",
              },
              data: { status: "AVAILABLE", lockedBy: null, lockedAt: null },
            });
          }
        }
      });

      expiredCount++;
    }

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Expired ${expiredCount} bookings`,
    });
  } catch (error) {
    console.error("Cron expire error:", error);
    return NextResponse.json({ error: "Failed to expire bookings" }, { status: 500 });
  }
}
