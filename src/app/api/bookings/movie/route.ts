import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { showtimeId, seatIds } = await req.json();

    if (!showtimeId || !seatIds || seatIds.length === 0) {
      return NextResponse.json({ error: "Showtime and seats are required" }, { status: 400 });
    }

    if (seatIds.length > 10) {
      return NextResponse.json({ error: "Maximum 10 seats per booking" }, { status: 400 });
    }

    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        screen: {
          include: {
            seats: true,
            theatre: true,
          },
        },
        movie: true,
      },
    });

    if (!showtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    if (new Date(showtime.startTime) < new Date()) {
      return NextResponse.json({ error: "This show has already started" }, { status: 400 });
    }

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingStatuses = await prisma.showtimeSeatStatus.findMany({
      where: {
        showtimeId,
        seatId: { in: seatIds },
        OR: [
          { status: "BOOKED" },
          { 
            status: "LOCKED",
            lockedAt: { gt: tenMinsAgo }
          }
        ]
      },
    });

    if (existingStatuses.length > 0) {
      return NextResponse.json(
        { error: "Some selected seats are already booked or temporarily locked by another user." },
        { status: 409 }
      );
    }

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
    });

    let totalAmount = 0;
    const seatPrices = seats.map((seat: any) => {
      let price = showtime.basePrice;
      if (seat.type === "PREMIUM") price = showtime.premiumPrice;
      if (seat.type === "VIP") price = showtime.vipPrice;
      totalAmount += price;
      return { seatId: seat.id, price };
    });

    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.$transaction(async (tx: any) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: session.userId,
          type: "MOVIE",
          status: "PENDING",
          totalAmount,
          lockedUntil,
          movieDetail: {
            create: {
              showtimeId,
              seats: {
                create: seatPrices.map((sp: any) => ({
                  seatId: sp.seatId,
                  price: sp.price,
                })),
              },
            },
          },
        },
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
                    include: { theatre: true },
                  },
                },
              },
            },
          },
        },
      });

      for (const seatId of seatIds) {
        await tx.showtimeSeatStatus.upsert({
          where: {
            showtimeId_seatId: { showtimeId, seatId },
          },
          update: {
            status: "LOCKED",
            lockedBy: session.userId,
            lockedAt: new Date(),
          },
          create: {
            showtimeId,
            seatId,
            status: "LOCKED",
            lockedBy: session.userId,
            lockedAt: new Date(),
          },
        });
      }

      return newBooking;
    });

    return NextResponse.json({ booking, lockedUntil: lockedUntil.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Movie booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
