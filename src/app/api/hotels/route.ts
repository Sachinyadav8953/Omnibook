import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");

    const where: Record<string, unknown> = { isActive: true };
    if (cityId) where.cityId = cityId;
    if (rating) where.starRating = { gte: parseInt(rating) };

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        city: true,
        roomTypes: {
          where: {
            ...(minPrice || maxPrice
              ? {
                  pricePerNight: {
                    ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
                    ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
                  },
                }
              : {}),
            ...(guests ? { maxGuests: { gte: parseInt(guests) } } : {}),
          },
          orderBy: { pricePerNight: "asc" },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { starRating: "desc" },
    });

    const hotelsWithAvailability = await Promise.all(
      hotels.map(async (hotel) => {
        const avgRating =
          hotel.reviews.length > 0
            ? hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / hotel.reviews.length
            : 0;

        let roomTypesWithAvailability = hotel.roomTypes;

        if (checkIn && checkOut) {
          roomTypesWithAvailability = await Promise.all(
            hotel.roomTypes.map(async (rt) => {
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
        }

        return {
          ...hotel,
          roomTypes: roomTypesWithAvailability,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: hotel.reviews.length,
          startingPrice:
            hotel.roomTypes.length > 0
              ? Math.min(...hotel.roomTypes.map((rt) => rt.pricePerNight))
              : 0,
        };
      })
    );

    return NextResponse.json({ hotels: hotelsWithAvailability });
  } catch {
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }
}
