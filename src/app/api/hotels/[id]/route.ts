import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHotelDetails, getHotelPhotos } from "@/lib/rapidapi";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");


    if (id.startsWith("rapid-")) {
      const rapidId = id.replace("rapid-", "");
      
      let detailsData, photosData;
      try {
        [detailsData, photosData] = await Promise.all([
          getHotelDetails(rapidId).catch(() => null),
          getHotelPhotos(rapidId).catch(() => null),
        ]);
      } catch (e) {
        console.error("RapidAPI fetch failed in details route:", e);
      }

      const hotelName = detailsData?.hotel_name || detailsData?.name || "Exclusive Luxury Hotel";
      const address = detailsData?.address || "Premium Location";
      const city = detailsData?.city || "Premium Destination";
      const state = detailsData?.country_trans || detailsData?.country || "Global";
      
      const images = photosData && Array.isArray(photosData) 
        ? photosData.slice(0, 5).map((p: any) => p.url_max || p.url_1440)
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];
        
      const mainImage = images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";

      const basePrice = Math.floor(Math.random() * 8000) + 4000;

      const dummyRoomTypes = [
        {
          id: `${id}-rt1`,
          name: "Deluxe King Room",
          description: "A spacious and luxurious room featuring a king-sized bed, premium bedding, and a marble ensuite bathroom.",
          pricePerNight: basePrice,
          totalRooms: 15,
          maxGuests: 2,
          amenities: ["WiFi", "Tv", "Bath", "Air Conditioning"],
          imageUrl: mainImage,
          availableRooms: 10,
        },
        {
          id: `${id}-rt2`,
          name: "Premium Suite",
          description: "Elevate your stay with our premium suite offering sweeping city views and a separate living area.",
          pricePerNight: basePrice * 1.5,
          totalRooms: 5,
          maxGuests: 4,
          amenities: ["WiFi", "Tv", "Bath", "Mini Bar", "Room Service"],
          imageUrl: images[1] || mainImage,
          availableRooms: 3,
        }
      ];

      return NextResponse.json({
        hotel: {
          id: id,
          name: hotelName,
          address: address,
          description: detailsData?.description || "Experience ultimate luxury and comfort at our highly-rated property. Enjoy world-class amenities and exceptional hospitality tailored just for you.",
          starRating: detailsData?.class || 5,
          amenities: ["WiFi", "Coffee", "Tv", "Bath", "Restaurant", "Room Service"],
          imageUrl: mainImage,
          images: images,
          avgRating: detailsData?.review_score || 4.5,
          reviewCount: detailsData?.review_nr || 120,
          city: { name: city, state: state },
          roomTypes: dummyRoomTypes,
          reviews: []
        }
      });
    }


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
      hotel.roomTypes.map(async (rt: any) => {
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
        ? hotel.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / hotel.reviews.length
        : 0;

    return NextResponse.json({
      hotel: {
        ...hotel,
        roomTypes: roomTypesWithAvailability,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: hotel.reviews.length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch hotel" }, { status: 500 });
  }
}
