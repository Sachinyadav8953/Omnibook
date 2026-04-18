import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        city: true,
        roomTypes: {
          orderBy: { pricePerNight: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const roomTypesWithAvailability = await Promise.all(
      hotel.roomTypes.map(async (rt) => {
        if (!checkIn || !checkOut) {
          return { ...rt, availableRooms: rt.totalRooms };
        }

        const bookedRooms = await prisma.hotelBookingDetail.aggregate({
          where: {
            roomTypeId: rt.id,
            booking: {
              status: { in: ["CONFIRMED", "PENDING"] },
            },
            checkIn: { lt: new Date(checkOut) },
            checkOut: { gt: new Date(checkIn) },
          },
          _sum: { rooms: true },
        });

        const available = rt.totalRooms - (bookedRooms._sum.rooms || 0);
        return { ...rt, availableRooms: Math.max(0, available) };
      })
    );

    const avgRating =
      hotel.reviews.length > 0
        ? hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / hotel.reviews.length
        : 0;

    return NextResponse.json({
      hotel: {
        ...hotel,
        roomTypes: roomTypesWithAvailability,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: hotel.reviews.length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch hotel" }, { status: 500 });
  }
}
