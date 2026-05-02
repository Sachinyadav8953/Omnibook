import { NextRequest, NextResponse } from "next/server";
import { bookSeats, getBookedSeats } from "@/lib/cinemaData";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { showtimeId, seatIds, totalAmount } = body;

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "showtimeId and seatIds[] are required" },
        { status: 400 }
      );
    }


    const bookedSet = getBookedSeats(showtimeId);
    const alreadyBooked = seatIds.filter((id: string) => bookedSet.has(id));

    if (alreadyBooked.length > 0) {
      return NextResponse.json(
        { error: "Some seats are already booked", alreadyBooked },
        { status: 409 }
      );
    }

    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
    const amount = typeof totalAmount === "number" ? totalAmount : 500;

    const booking = await prisma.booking.create({
      data: {
        userId: session.userId,
        type: "MOVIE",
        status: "PENDING",
        totalAmount: amount,
        lockedUntil,
      },
    });


    bookSeats(showtimeId, seatIds);

    return NextResponse.json({
      success: true,
      message: `${seatIds.length} seat(s) booked successfully!`,
      bookedSeatIds: seatIds,
      booking,
      lockedUntil: lockedUntil.toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book seats" },
      { status: 500 }
    );
  }
}
