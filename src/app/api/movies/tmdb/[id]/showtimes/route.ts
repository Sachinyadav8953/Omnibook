import { NextRequest, NextResponse } from "next/server";
import { generateShowtimes } from "@/lib/cinemaData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const userLat = parseFloat(searchParams.get("lat") || "");
    const userLng = parseFloat(searchParams.get("lng") || "");


    const showtimes = generateShowtimes(
      id,
      !isNaN(userLat) ? userLat : undefined,
      !isNaN(userLng) ? userLng : undefined
    );

    return NextResponse.json({ showtimes });
  } catch (error) {
    console.error("Error generating showtimes:", error);
    return NextResponse.json(
      { error: "Failed to load showtimes" },
      { status: 500 }
    );
  }
}
