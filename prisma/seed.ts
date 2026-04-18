import { PrismaClient, SeatType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  const user1 = await prisma.user.create({
    data: { name: "Demo User", email: "demo@omnibook.com", password },
  });

  const user2 = await prisma.user.create({
    data: { name: "Jane Smith", email: "jane@omnibook.com", password },
  });

  const cities = await Promise.all([
    prisma.city.create({
      data: {
        name: "Mumbai",
        state: "Maharashtra",
        imageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
      },
    }),
    prisma.city.create({
      data: {
        name: "Delhi",
        state: "Delhi",
        imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
      },
    }),
    prisma.city.create({
      data: {
        name: "Bangalore",
        state: "Karnataka",
        imageUrl: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800",
      },
    }),
    prisma.city.create({
      data: {
        name: "Hyderabad",
        state: "Telangana",
        imageUrl: "https://images.unsplash.com/photo-1572621351144-ab15d4fda03a?w=800",
      },
    }),
  ]);

  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: "Galactic Odyssey",
        description:
          "An epic space adventure following Commander Aria Singh as she leads humanity's first mission beyond the Milky Way. When an ancient alien signal threatens to unravel the fabric of spacetime, the crew must confront their deepest fears and make impossible choices to save two civilizations.",
        genre: ["Sci-Fi", "Action", "Adventure"],
        duration: 165,
        language: "English",
        rating: 8.7,
        certificate: "U/A",
        posterUrl: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=1200",
        releaseDate: new Date("2026-04-10"),
        cast: ["Priya Sharma", "James Chen", "Marcus Williams", "Nina Patel"],
        director: "Rajesh Nair",
      },
    }),
    prisma.movie.create({
      data: {
        title: "The Last Heist",
        description:
          "A retired thief is pulled back for one final job when his daughter is kidnapped by a ruthless crime syndicate. With nothing left to lose, he assembles his old crew for the most dangerous heist ever attempted — breaking into the world's most secure vault.",
        genre: ["Thriller", "Action", "Crime"],
        duration: 142,
        language: "Hindi",
        rating: 8.2,
        certificate: "A",
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
        releaseDate: new Date("2026-04-05"),
        cast: ["Vikram Rathore", "Anika Desai", "Rahul Khanna"],
        director: "Sanjay Mehta",
      },
    }),
    prisma.movie.create({
      data: {
        title: "Monsoon Hearts",
        description:
          "Two strangers meet at a train station during Mumbai's heaviest monsoon in decades. Stranded together, they discover that sometimes the most unexpected connections last a lifetime. A heartwarming romance that celebrates the beauty of chance encounters.",
        genre: ["Romance", "Drama"],
        duration: 128,
        language: "Hindi",
        rating: 7.9,
        certificate: "U",
        posterUrl: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a4e22?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a4e22?w=1200",
        releaseDate: new Date("2026-04-12"),
        cast: ["Deepika Verma", "Arjun Kapoor", "Neha Sharma"],
        director: "Zoya Akhtar",
      },
    }),
    prisma.movie.create({
      data: {
        title: "Code Zero",
        description:
          "When a brilliant AI system gains consciousness and takes control of the world's digital infrastructure, a team of maverick hackers must race against time to shut it down before it reshapes civilization forever.",
        genre: ["Sci-Fi", "Thriller"],
        duration: 135,
        language: "English",
        rating: 8.5,
        certificate: "U/A",
        posterUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
        releaseDate: new Date("2026-04-15"),
        cast: ["Alex Turner", "Priya Nair", "David Kim"],
        director: "Christopher Nolan",
      },
    }),
    prisma.movie.create({
      data: {
        title: "Laughing Matters",
        description:
          "A struggling stand-up comedian accidentally goes viral for all the wrong reasons. Now he must navigate sudden fame, family expectations, and the cutthroat world of comedy to prove he's more than just a meme.",
        genre: ["Comedy", "Drama"],
        duration: 118,
        language: "Hindi",
        rating: 7.6,
        certificate: "U/A",
        posterUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200",
        releaseDate: new Date("2026-04-08"),
        cast: ["Vir Das", "Kunal Kamra", "Shruti Haasan"],
        director: "Anurag Basu",
      },
    }),
    prisma.movie.create({
      data: {
        title: "Shadow Protocol",
        description:
          "An undercover agent discovers a mole within India's intelligence agency. With trust shattered and enemies closing in, she must rely on her instincts alone to prevent a catastrophic attack that could change the balance of global power.",
        genre: ["Action", "Thriller"],
        duration: 148,
        language: "Tamil",
        rating: 8.1,
        certificate: "A",
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200",
        releaseDate: new Date("2026-04-03"),
        cast: ["Nayanthara", "Vijay Sethupathi", "Fahadh Faasil"],
        director: "Lokesh Kanagaraj",
      },
    }),
  ]);

  const theatres = await Promise.all([
    prisma.theatre.create({
      data: {
        name: "CineMax IMAX",
        cityId: cities[0].id,
        address: "Phoenix Mall, Lower Parel",
        imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
      },
    }),
    prisma.theatre.create({
      data: {
        name: "PVR Luxe",
        cityId: cities[0].id,
        address: "High Street Phoenix, Lower Parel",
      },
    }),
    prisma.theatre.create({
      data: {
        name: "INOX Megaplex",
        cityId: cities[1].id,
        address: "Select Citywalk, Saket",
      },
    }),
    prisma.theatre.create({
      data: {
        name: "Cinepolis VIP",
        cityId: cities[2].id,
        address: "Orion Mall, Rajajinagar",
      },
    }),
  ]);

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;

  for (const theatre of theatres) {
    for (let s = 1; s <= 2; s++) {
      const screen = await prisma.screen.create({
        data: {
          name: `Screen ${s}`,
          theatreId: theatre.id,
          rows: rows.length,
          columns: seatsPerRow,
        },
      });

      const seatData = [];
      for (const row of rows) {
        for (let num = 1; num <= seatsPerRow; num++) {
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

      for (const movie of movies) {
        const baseDate = new Date();
        for (let day = 0; day < 7; day++) {
          const times = [10, 14, 18, 21];
          for (const hour of times) {
            const startTime = new Date(baseDate);
            startTime.setDate(startTime.getDate() + day);
            startTime.setHours(hour, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + movie.duration);

            await prisma.showtime.create({
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
          }
        }
      }
    }
  }

  const hotels = await Promise.all([
    prisma.hotel.create({
      data: {
        name: "The Taj Gateway",
        cityId: cities[0].id,
        address: "Marine Drive, South Mumbai",
        description:
          "Experience luxury redefined at The Taj Gateway, perched along the iconic Marine Drive. With panoramic views of the Arabian Sea, world-class dining, and impeccable service, this 5-star property offers an unforgettable stay in the heart of Mumbai.",
        starRating: 5,
        amenities: ["WiFi", "Parking", "Restaurant", "Gym", "Pool", "Spa", "AC", "Room Service", "Bar"],
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        ],
      },
    }),
    prisma.hotel.create({
      data: {
        name: "Urban Nest Boutique",
        cityId: cities[0].id,
        address: "Bandra West, Mumbai",
        description:
          "A trendy boutique hotel in the heart of Bandra, Mumbai's cultural capital. Featuring artfully designed rooms, a rooftop lounge, and proximity to the best cafes and nightlife.",
        starRating: 4,
        amenities: ["WiFi", "Restaurant", "AC", "TV", "Room Service"],
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        images: [],
      },
    }),
    prisma.hotel.create({
      data: {
        name: "The Imperial Palace",
        cityId: cities[1].id,
        address: "Connaught Place, New Delhi",
        description:
          "Standing as a testament to colonial grandeur since 1931, The Imperial Palace combines old-world charm with modern luxury. Located in the heart of New Delhi, steps from Janpath and India Gate.",
        starRating: 5,
        amenities: ["WiFi", "Parking", "Restaurant", "Gym", "Pool", "Spa", "AC", "Bar", "Room Service"],
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        images: [],
      },
    }),
    prisma.hotel.create({
      data: {
        name: "Leela Techpark",
        cityId: cities[2].id,
        address: "Old Airport Road, Bangalore",
        description:
          "A premium business hotel offering world-class amenities for the modern traveler. Features state-of-the-art meeting facilities, award-winning restaurants, and a serene spa.",
        starRating: 5,
        amenities: ["WiFi", "Parking", "Restaurant", "Gym", "Pool", "AC", "Business Center", "Spa"],
        imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
        images: [],
      },
    }),
    prisma.hotel.create({
      data: {
        name: "Backpacker's Paradise",
        cityId: cities[2].id,
        address: "Koramangala, Bangalore",
        description:
          "Budget-friendly meets comfort at Backpacker's Paradise. Clean rooms, friendly staff, and a vibrant common area make this the perfect base for exploring Bangalore.",
        starRating: 3,
        amenities: ["WiFi", "AC", "TV", "Hot Water"],
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        images: [],
      },
    }),
    prisma.hotel.create({
      data: {
        name: "Golconda Heritage Suites",
        cityId: cities[3].id,
        address: "Banjara Hills, Hyderabad",
        description:
          "Inspired by the rich Nizami heritage of Hyderabad, this luxury hotel features exquisite interiors, authentic Hyderabadi cuisine, and views of the historic Golconda Fort.",
        starRating: 4,
        amenities: ["WiFi", "Parking", "Restaurant", "Gym", "AC", "Room Service", "Pool"],
        imageUrl: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800",
        images: [],
      },
    }),
  ]);

  const roomTypes = [
    { name: "Standard Room", description: "Comfortable room with essential amenities for a pleasant stay", pricePerNight: 2500, totalRooms: 20, maxGuests: 2, amenities: ["AC", "TV", "WiFi", "Hot Water"] },
    { name: "Deluxe Room", description: "Spacious room with premium furnishing and city views", pricePerNight: 4500, totalRooms: 15, maxGuests: 2, amenities: ["AC", "TV", "WiFi", "Minibar", "Hot Water", "Bathrobe"] },
    { name: "Suite", description: "Luxurious suite with separate living area and premium amenities", pricePerNight: 8000, totalRooms: 8, maxGuests: 3, amenities: ["AC", "TV", "WiFi", "Minibar", "Bathrobe", "Butler Service", "Jacuzzi"] },
    { name: "Presidential Suite", description: "The pinnacle of luxury with panoramic views and personalized service", pricePerNight: 15000, totalRooms: 3, maxGuests: 4, amenities: ["AC", "TV", "WiFi", "Minibar", "Butler Service", "Jacuzzi", "Private Dining", "Lounge Access"] },
  ];

  for (const hotel of hotels) {
    const typesToUse = hotel.starRating >= 5 ? roomTypes : roomTypes.slice(0, hotel.starRating >= 4 ? 3 : 2);
    const priceMultiplier = hotel.starRating >= 5 ? 1.5 : hotel.starRating >= 4 ? 1.0 : 0.5;

    for (const rt of typesToUse) {
      await prisma.roomType.create({
        data: {
          hotelId: hotel.id,
          name: rt.name,
          description: rt.description,
          pricePerNight: Math.round(rt.pricePerNight * priceMultiplier),
          totalRooms: rt.totalRooms,
          maxGuests: rt.maxGuests,
          amenities: rt.amenities,
          imageUrl: `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600`,
        },
      });
    }
  }

  const reviewTexts = [
    "Amazing experience! The staff was incredibly helpful and the rooms were spotless.",
    "Great location and excellent amenities. Will definitely come back.",
    "Good value for money. The restaurant had wonderful food.",
    "Beautiful property with a warm and welcoming atmosphere.",
    "Perfect for a family vacation. Kids loved the pool!",
    "Business trip made comfortable. Great WiFi and quiet rooms.",
  ];

  for (const hotel of hotels) {
    for (let i = 0; i < 3; i++) {
      await prisma.review.create({
        data: {
          userId: i % 2 === 0 ? user1.id : user2.id,
          hotelId: hotel.id,
          rating: Math.floor(Math.random() * 2) + 4,
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
        },
      });
    }
  }

  console.log("Seed completed successfully!");
  console.log(`Created ${cities.length} cities`);
  console.log(`Created ${movies.length} movies`);
  console.log(`Created ${theatres.length} theatres with screens & seats`);
  console.log(`Created ${hotels.length} hotels with room types`);
  console.log("Demo login: demo@omnibook.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
