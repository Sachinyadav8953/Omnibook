import { NextRequest, NextResponse } from "next/server";
import { bookSeats, getBookedSeats } from "@/lib/cinemaData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { showtimeId, seatIds } = body;

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "showtimeId and seatIds[] are required" },
        { status: 400 }
      );
    }

    // Check if any seats are already booked
    const bookedSet = getBookedSeats(showtimeId);
    const alreadyBooked = seatIds.filter((id: string) => bookedSet.has(id));

    if (alreadyBooked.length > 0) {
      return NextResponse.json(
        { error: "Some seats are already booked", alreadyBooked },
        { status: 409 }
      );
    }

    // Book the seats
    bookSeats(showtimeId, seatIds);

    return NextResponse.json({
      success: true,
      message: `${seatIds.length} seat(s) booked successfully!`,
      bookedSeatIds: seatIds,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book seats" },
      { status: 500 }
    );
  }
}
