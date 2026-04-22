import { PrismaClient, SeatType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const INDIAN_STATES_CITIES = [
  { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"] },
  { state: "Delhi", cities: ["Delhi", "Noida", "Gurgaon"] },
  { state: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore"] },
  { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"] },
  { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Trichy"] },
  { state: "West Bengal", cities: ["Kolkata", "Siliguri", "Durgapur"] },
  { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
  { state: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj"] },
  { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur"] },
  { state: "Punjab", cities: ["Chandigarh", "Ludhiana", "Amritsar"] },
  { state: "Kerala", cities: ["Kochi", "Thiruvananthapuram", "Kozhikode"] },
  { state: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Gwalior"] },
];

const THEATRE_NAMES = [
  "CineMax", "PVR", "INOX", "Cinepolis", "Miraj Cinemas", "Carnival Cinemas", "MovieTime", "Asian Cinemas", "Mukta A2", "SRS Cinemas"
];

const THEATRE_SUFFIXES = [
  "IMAX", "Luxe", "Megaplex", "Gold", "Prive", "Cinemas", "Talkies", "Entertainment", "Square", "Point"
];

async function main() {
  console.log("Cleaning up database...");
  await prisma.seatTicket.deleteMany();
  await prisma.movieBookingDetail.deleteMany();
  await prisma.hotelBookingDetail.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.showtimeSeatStatus.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.theatre.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  console.log("Creating users...");
  const user1 = await prisma.user.create({
    data: { name: "Demo User", email: "demo@omnibook.com", password },
  });

  const user2 = await prisma.user.create({
    data: { name: "Jane Smith", email: "jane@omnibook.com", password },
  });

  console.log("Creating movies...");
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        id: "tmdb-galactic-odyssey",
        title: "Galactic Odyssey",
        description: "An epic space adventure following Commander Aria Singh as she leads humanity's first mission beyond the Milky Way.",
        genre: ["Sci-Fi", "Action", "Adventure"],
        duration: 165,
        language: "English",
        rating: 8.7,
        certificate: "U/A",
        posterUrl: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=1200",
        releaseDate: new Date("2026-04-10"),
        cast: ["Priya Sharma", "James Chen"],
        director: "Rajesh Nair",
      },
    }),
    prisma.movie.create({
      data: {
        id: "tmdb-last-heist",
        title: "The Last Heist",
        description: "A retired thief is pulled back for one final job when his daughter is kidnapped.",
        genre: ["Thriller", "Action", "Crime"],
        duration: 142,
        language: "Hindi",
        rating: 8.2,
        certificate: "A",
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
        releaseDate: new Date("2026-04-05"),
        cast: ["Vikram Rathore", "Anika Desai"],
        director: "Sanjay Mehta",
      },
    }),
  ]);

  console.log("Creating cities and theatres...");
  let totalTheatres = 0;
  const theatresList = [];

  for (const item of INDIAN_STATES_CITIES) {
    for (const cityName of item.cities) {
      const city = await prisma.city.create({
        data: {
          name: cityName,
          state: item.state,
          imageUrl: `https://source.unsplash.com/800x600/?${cityName},city`,
        },
      });

      // Around 4-5 theatres per city to reach ~150 total
      const theatreCount = 4 + Math.floor(Math.random() * 2); 
      for (let i = 0; i < theatreCount; i++) {
        const theatreName = `${THEATRE_NAMES[Math.floor(Math.random() * THEATRE_NAMES.length)]} ${THEATRE_SUFFIXES[Math.floor(Math.random() * THEATRE_SUFFIXES.length)]} ${i + 1}`;
        
        // Random lat/long (rough India bounds for demo)
        const lat = 10 + Math.random() * 25;
        const lng = 68 + Math.random() * 25;

        const theatre = await prisma.theatre.create({
          data: {
            name: theatreName,
            cityId: city.id,
            address: `${i+101}, Main Road, ${cityName}`,
            latitude: lat,
            longitude: lng,
            imageUrl: `https://source.unsplash.com/800x600/?cinema,theatre&sig=${totalTheatres}`,
          },
        });

        // Add Screens and Seats (simplified for bulk)
        const screen = await prisma.screen.create({
          data: {
            name: "Screen 1",
            theatreId: theatre.id,
            rows: 8,
            columns: 12,
          },
        });

        const seatData = [];
        const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
        for (const row of rowLabels) {
          for (let num = 1; num <= 12; num++) {
            let type: SeatType = "REGULAR";
            if (row === "G" || row === "H") type = "VIP";
            else if (row === "E" || row === "F") type = "PREMIUM";

            seatData.push({
              screenId: screen.id,
              row,
              number: num,
              type,
            });
          }
        }
        await prisma.seat.createMany({ data: seatData });

        // Add some showtimes for the movies
        for (const movie of movies) {
          const startTime = new Date();
          startTime.setHours(10 + i * 2, 0, 0, 0); // Spaced out times
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + movie.duration);

          const showtime = await prisma.showtime.create({
            data: {
              movieId: movie.id,
              screenId: screen.id,
              startTime,
              endTime,
              basePrice: 200 + Math.floor(Math.random() * 100),
              premiumPrice: 350 + Math.floor(Math.random() * 100),
              vipPrice: 500 + Math.floor(Math.random() * 150),
            },
          });

          // Randomly mark some seats as booked
          const screenSeats = await prisma.seat.findMany({ where: { screenId: screen.id } });
          const bookedSeatData = screenSeats
            .sort(() => 0.5 - Math.random())
            .slice(0, 15) // mark 15 random seats as booked
            .map(seat => ({
              showtimeId: showtime.id,
              seatId: seat.id,
              status: "BOOKED" as const,
            }));
          
          await prisma.showtimeSeatStatus.createMany({ data: bookedSeatData });
        }

        totalTheatres++;
        if (totalTheatres >= 150) break;
      }
      if (totalTheatres >= 150) break;
    }
    if (totalTheatres >= 150) break;
  }

  console.log(`Seed completed! Created ${totalTheatres} theatres across India.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
