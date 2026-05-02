import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    let whereClause: any = {};

    if (month) {
      const monthInt = parseInt(month);
      if (!isNaN(monthInt)) {
        whereClause.bestMonths = {
          has: monthInt,
        };
      }
    }

    if (category) {
      whereClause.tags = {
        has: category,
      };
    }

    try {
      const destinations = await prisma.destination.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
      });

      if (destinations.length > 0) {
        return NextResponse.json({ destinations });
      }
    } catch (dbError) {
      console.warn("DB connection failed or empty, falling back to live API fetch:", dbError);
    }


    try {
      const restRes = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,region");
      const countries = await restRes.json();

      let validCountries = countries.filter((c: any) => c.capital && c.capital.length > 0 && c.region);

      validCountries = validCountries.sort(() => 0.5 - Math.random());


      const selected = validCountries.slice(0, 60);

      const seasons = ["Spring", "Summer", "Autumn", "Winter"];
      const bestMonthsMap: Record<string, number[]> = {
        "Spring": [3, 4, 5],
        "Summer": [6, 7, 8],
        "Autumn": [9, 10, 11],
        "Winter": [12, 1, 2]
      };

      const fetchedDestinations = await Promise.all(selected.map(async (c: any, index: number) => {
        const city = c.capital[0];
        const country = c.name.common;
        const region = c.region;
        const season = seasons[Math.floor(index / 15)];

        let description = `Experience the beautiful city of ${city}. A wonderful destination full of culture, history, and vibrant life.`;
        let imageUrl = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800";

        try {
          const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`);
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            description = wikiData.extract || description;
            imageUrl = wikiData.originalimage?.source || wikiData.thumbnail?.source || imageUrl;
          }
        } catch (e) {


        }

        return {
          id: `dyn_${index}`,
          name: city,
          country: country,
          description,
          images: [imageUrl],
          tags: [season, region],
          bestMonths: bestMonthsMap[season],
          seasonType: season,
          attractions: [`Historic Downtown ${city}`, `National Museum of ${country}`],
          weather: "Seasonal",
          peakSeason: season,
          culture: `${country} Heritage`
        };
      }));

      let filteredMock = fetchedDestinations;
      if (month) {
        const monthInt = parseInt(month);
        filteredMock = filteredMock.filter((d: any) => d.bestMonths.includes(monthInt));
      }
      if (category) {
        filteredMock = filteredMock.filter((d: any) => d.tags.includes(category) || d.seasonType === category);
      }

      return NextResponse.json({ destinations: filteredMock });
    } catch (apiError) {
      console.error("Live fetch fallback failed:", apiError);
      return NextResponse.json({ destinations: [] });
    }
  } catch (error) {
    console.error("Destinations API error:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
