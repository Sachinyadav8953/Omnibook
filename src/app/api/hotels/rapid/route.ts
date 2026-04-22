import { NextRequest, NextResponse } from "next/server";
import { searchHotels, searchLocations } from "@/lib/rapidapi";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkin = searchParams.get("checkin") || today.toISOString().split('T')[0];
    const checkout = searchParams.get("checkout") || tomorrow.toISOString().split('T')[0];
    const adults = searchParams.get("adults") || "2";
    
    if (!query) {
      return NextResponse.json({ error: "Missing query parameter (city name)" }, { status: 400 });
    }

    
    const locationData = await searchLocations(query);
    
    
    const bestMatch = locationData?.find((loc: any) => loc.dest_type === "city" || loc.type === "city");
    
    if (!bestMatch) {
      return NextResponse.json({ error: "City not found in Booking.com database." }, { status: 404 });
    }

    const destId = bestMatch.dest_id;
    const destType = bestMatch.dest_type;

    
    const hotelsData = await searchHotels(destId, destType, checkin, checkout, adults);

    
    const rawHotels = hotelsData.result || hotelsData.data || hotelsData || [];

    
    const mappedHotels = rawHotels.slice(0, 15).map((hotel: any) => {
      const price = hotel.min_total_price || hotel.price_breakdown?.gross_price || Math.floor(Math.random() * 10000) + 3000;
      return {
        id: `rapid-${hotel.hotel_id}`,
        name: hotel.hotel_name || hotel.name,
        address: hotel.address || hotel.address_trans || bestMatch.name,
        description: hotel.hotel_include_breakfast ? "Includes Breakfast. Enjoy a wonderful stay in a premium location." : "Enjoy a wonderful stay in a premium location.",
        starRating: hotel.class || 4,
        amenities: ["WiFi", "Room Service", "Restaurant"],
        imageUrl: hotel.max_photo_url || hotel.main_photo_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        avgRating: Number(hotel.review_score) || 4.2,
        reviewCount: hotel.review_nr || Math.floor(Math.random() * 500) + 50,
        startingPrice: price,
        city: { id: destId, name: bestMatch.name, state: bestMatch.country },
        roomTypes: [
          { id: "cm_r1", name: "Deluxe King Room", pricePerNight: price }
        ]
      };
    });

    return NextResponse.json({ hotels: mappedHotels });
    
  } catch (error) {
    console.error("RapidAPI connection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch hotels from RapidAPI." },
      { status: 500 }
    );
  }
}
