import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { acquireLock } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomTypeId, checkIn, checkOut, rooms, guests } = await req.json();

    if (!roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Room type, check-in, and check-out dates are required" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
    }

    if (checkInDate < new Date(new Date().toDateString())) {
      return NextResponse.json({ error: "Check-in cannot be in the past" }, { status: 400 });
    }

    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { hotel: { include: { city: true } } },
    });

    if (!roomType) {
      return NextResponse.json({ error: "Room type not found" }, { status: 404 });
    }

    const lockKey = `hotel:${roomTypeId}:${checkIn}:${checkOut}`;
    const locked = await acquireLock(lockKey, session.userId);

    if (!locked) {
      return NextResponse.json(
        { error: "Someone else is currently booking this room type. Please try again." },
        { status: 409 }
      );
    }

    const bookedRooms = await prisma.hotelBookingDetail.aggregate({
      where: {
        roomTypeId,
        booking: {
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
      _sum: { rooms: true },
    });

    const roomCount = rooms || 1;
    const available = roomType.totalRooms - (bookedRooms._sum.rooms || 0);

    if (available < roomCount) {
      return NextResponse.json(
        { error: `Only ${available} rooms available for these dates` },
        { status: 409 }
      );
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = roomType.pricePerNight * nights * roomCount;
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        userId: session.userId,
        type: "HOTEL",
        status: "PENDING",
        totalAmount,
        lockedUntil,
        hotelDetail: {
          create: {
            roomTypeId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            rooms: roomCount,
            guests: guests || 1,
          },
        },
      },
      include: {
        hotelDetail: {
          include: {
            roomType: {
              include: {
                hotel: { include: { city: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ booking, lockedUntil: lockedUntil.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Hotel booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
