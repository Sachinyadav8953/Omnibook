import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }


    const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (!summaryRes.ok) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }
    const summary = await summaryRes.json();
    

    const formattedTitle = summary.title;
    
    const destination = {
      id: summary.pageid?.toString() || query,
      name: formattedTitle,
      description: summary.extract,
      imageUrl: summary.originalimage?.source || summary.thumbnail?.source || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200",
      coordinates: summary.coordinates ? { lat: summary.coordinates.lat, lon: summary.coordinates.lon } : null,
    };


    let suggestions: any[] = [];
    if (destination.coordinates) {
      const geoRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${destination.coordinates.lat}|${destination.coordinates.lon}&gsradius=10000&gslimit=10&format=json`);
      const geoData = await geoRes.json();
      
      if (geoData.query?.geosearch) {

        const places = geoData.query.geosearch
          .filter((p: any) => p.title.toLowerCase() !== destination.name.toLowerCase())
          .slice(0, 4);
        

        const placePromises = places.map(async (place: any) => {
          try {
            const pRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place.title)}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              return {
                id: pData.pageid?.toString() || place.pageid?.toString(),
                name: pData.title,
                description: pData.extract ? (pData.extract.length > 80 ? pData.extract.substring(0, 80) + "..." : pData.extract) : "A popular local attraction.",
                imageUrl: pData.originalimage?.source || pData.thumbnail?.source || "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200",
              };
            }
          } catch (e) {

          }
          return {
              id: place.pageid?.toString(),
              name: place.title,
              description: "A popular place to visit nearby.",
              imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800",
          };
        });
        
        suggestions = await Promise.all(placePromises);
      }
    }


    if (suggestions.length === 0) {
       suggestions = [
         { id: "s1", name: `${destination.name} Downtown`, description: `Explore the vibrant heart of ${destination.name}.`, imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800" },
         { id: "s2", name: `Historic District`, description: "Step back in time in the old town.", imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" },
         { id: "s3", name: `Local Markets`, description: "Experience the authentic local culture.", imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800" }
       ];
    }

    return NextResponse.json({ destination, suggestions });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search destination" }, { status: 500 });
  }
}
