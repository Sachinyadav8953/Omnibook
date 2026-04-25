import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from "../src/lib/prisma";

async function fetchWikipediaData(city: string) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        description: data.extract,
        imageUrl: data.originalimage?.source || data.thumbnail?.source || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
      };
    }
  } catch (e) {
    console.error("Failed to fetch wiki for", city);
  }
  return {
    description: `Experience the beautiful city of ${city}. A wonderful destination full of culture, history, and vibrant life.`,
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800"
  };
}

const generateDestinations = async () => {
  console.log("Fetching countries from REST Countries API...");
  const res = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,region");
  const countries = await res.json();
  
  // Filter out those without capitals
  let validCountries = countries.filter((c: any) => c.capital && c.capital.length > 0 && c.region);
  
  // Shuffle randomly
  validCountries = validCountries.sort(() => 0.5 - Math.random());
  
  // We need 15 per season (4 seasons * 15 = 60 destinations)
  const requiredCount = 60;
  const selectedCountries = validCountries.slice(0, requiredCount);

  const seasons = ["Spring", "Summer", "Autumn", "Winter"];
  const bestMonthsMap: Record<string, number[]> = {
    "Spring": [3, 4, 5],
    "Summer": [6, 7, 8],
    "Autumn": [9, 10, 11],
    "Winter": [12, 1, 2]
  };

  const destinations = [];
  
  for (let i = 0; i < selectedCountries.length; i++) {
    const c = selectedCountries[i];
    const city = c.capital[0];
    const country = c.name.common;
    const region = c.region;
    
    // Assign season evenly
    const season = seasons[Math.floor(i / 15)];
    const bestMonths = bestMonthsMap[season];

    console.log(`Fetching wiki data for ${city}, ${country} (${i+1}/${requiredCount})...`);
    const wikiData = await fetchWikipediaData(city);
    
    // Delay to not hammer wikipedia
    await new Promise(r => setTimeout(r, 200));

    destinations.push({
      name: city,
      country: country,
      region: region,
      description: wikiData.description,
      images: [wikiData.imageUrl],
      tags: [season, region],
      bestMonths: bestMonths,
      seasonType: season,
      climate: "Varied",
      budget: ["Budget", "Moderate", "Luxury"][Math.floor(Math.random() * 3)],
      attractions: [`Historic Downtown ${city}`, `National Museum of ${country}`],
      weather: "Seasonal",
      peakSeason: season,
      culture: `${country} Heritage`
    });
  }

  return destinations;
};

async function main() {
  console.log("Generating destinations by season...");
  const destinations = generateDestinations();
  
  console.log("Clearing existing destinations...");
  await prisma.destination.deleteMany({});
  
  console.log("Inserting destinations into Neon DB...");
  const created = await prisma.destination.createMany({
    data: destinations
  });
  
  console.log(`Successfully seeded ${created.count} destinations!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
