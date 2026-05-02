import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomTypeId, checkIn, checkOut, rooms, guests, hotelName, roomTypeName, pricePerNight } = await req.json();

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

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const roomCount = rooms || 1;
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);


    if (roomTypeId.startsWith("rapid-")) {
      const hotelId = roomTypeId.replace(/-rt\d+$/, "");
      const price = pricePerNight || 5000;
      const totalAmount = price * nights * roomCount;


      const placeholderCity = await prisma.city.upsert({
        where: { id: "rapid-city" },
        update: {},
        create: {
          id: "rapid-city",
          name: "International",
          state: "Global",
          country: "Worldwide",
        },
      });


      await prisma.hotel.upsert({
        where: { id: hotelId },
        update: {},
        create: {
          id: hotelId,
          name: hotelName || "Premium Hotel",
          cityId: placeholderCity.id,
          address: "Premium Location",
          description: "Booked via Booking.com integration",
          starRating: 4,
          amenities: ["WiFi", "Room Service"],
          isActive: true,
        },
      });


      await prisma.roomType.upsert({
        where: { id: roomTypeId },
        update: { pricePerNight: price },
        create: {
          id: roomTypeId,
          hotelId: hotelId,
          name: roomTypeName || "Deluxe Room",
          description: "Room booked via external platform",
          pricePerNight: price,
          totalRooms: 50,
          maxGuests: guests || 2,
          amenities: ["WiFi", "TV"],
        },
      });


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
    }


    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { hotel: { include: { city: true } } },
    });

    if (!roomType) {
      return NextResponse.json({ error: "Room type not found" }, { status: 404 });
    }

    const bookedRooms = await prisma.hotelBookingDetail.aggregate({
      where: {
        roomTypeId,
        booking: {
          OR: [
            { status: "CONFIRMED" },
            { 
              status: "PENDING",
              lockedUntil: { gt: new Date() }
            }
          ]
        },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
      _sum: { rooms: true },
    });

    const available = roomType.totalRooms - (bookedRooms._sum.rooms || 0);

    if (available < roomCount) {
      return NextResponse.json(
        { error: `Only ${available} rooms available for these dates` },
        { status: 409 }
      );
    }

    const totalAmount = roomType.pricePerNight * nights * roomCount;

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
