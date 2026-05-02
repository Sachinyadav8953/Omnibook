

export interface CinemaSeat {
  id: string;
  row: string;
  number: number;
  type: "REGULAR" | "PREMIUM" | "VIP";
}

export interface CinemaScreen {
  id: string;
  name: string;
  seats: CinemaSeat[];
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  screens: CinemaScreen[];
}

export interface CinemaShowtime {
  id: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  premiumPrice: number;
  vipPrice: number;
  screen: CinemaScreen & { theatre: { id: string; name: string; address: string; city: string } };
  seatStatuses: { seatId: string; status: "AVAILABLE" | "BOOKED" | "LOCKED" }[];
}



const CITIES: { city: string; state: string; lat: number; lng: number }[] = [

  { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { city: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { city: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { city: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },

  { city: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { city: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { city: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },

  { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { city: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { city: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.124 },
  { city: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.856 },

  { city: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { city: "Warangal", state: "Telangana", lat: 17.9784, lng: 79.5941 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },

  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { city: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },

  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { city: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953 },

  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { city: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { city: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },

  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { city: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { city: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { city: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },

  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { city: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { city: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },

  { city: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794 },
  { city: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573 },
  { city: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },

  { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { city: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },

  { city: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },

  { city: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },

  { city: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },

  { city: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },

  { city: "Patna", state: "Bihar", lat: 25.6093, lng: 85.1376 },

  { city: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },

  { city: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278 },
];



const CHAINS = [
  "PVR", "INOX", "Cinepolis", "Carnival Cinemas", "Miraj Cinemas",
  "CineMax", "SRS Cinemas", "MovieTime", "Asian Cinemas", "Mukta A2",
  "Fun Cinemas", "Filmcity", "Rajhans Cinemas", "Wave Cinemas", "BIG Cinemas",
];

const SUFFIXES = [
  "IMAX", "Luxe", "Megaplex", "Gold Class", "Prive",
  "Multiplex", "4DX", "ScreenX", "Icon", "Superplex",
];

const ADDRESSES = [
  "Phoenix Mall", "Forum Mall", "Orion Mall", "Select Citywalk", "DLF Mall",
  "Ambience Mall", "Inorbit Mall", "VR Mall", "Nexus Mall", "Pacific Mall",
  "City Centre", "South City", "Junction Mall", "Express Mall", "Grand Mall",
  "Market Road", "Station Road", "MG Road", "Ring Road", "Main Street",
];



function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}



function buildCinemas(): Cinema[] {
  const cinemas: Cinema[] = [];
  const rng = seededRandom(42);
  let cinemaIdx = 0;


  const distribution: Record<string, number> = {
    "Mumbai": 8, "New Delhi": 7, "Bangalore": 7, "Hyderabad": 6,
    "Chennai": 6, "Kolkata": 5, "Pune": 5, "Ahmedabad": 4,
    "Surat": 3, "Jaipur": 4, "Lucknow": 4, "Chandigarh": 3,
    "Kochi": 3, "Gurgaon": 4, "Noida": 4, "Coimbatore": 3,
  };

  for (const cityInfo of CITIES) {
    const count = distribution[cityInfo.city] || 2;
    
    for (let i = 0; i < count && cinemaIdx < 150; i++) {
      const chain = CHAINS[Math.floor(rng() * CHAINS.length)];
      const suffix = SUFFIXES[Math.floor(rng() * SUFFIXES.length)];
      const addr = ADDRESSES[Math.floor(rng() * ADDRESSES.length)];


      const latOffset = (rng() - 0.5) * 0.1;
      const lngOffset = (rng() - 0.5) * 0.1;

      const screenCount = 1 + Math.floor(rng() * 2);
      const screens: CinemaScreen[] = [];

      for (let s = 0; s < screenCount; s++) {
        const screenId = `scr-${cinemaIdx}-${s}`;
        const seats: CinemaSeat[] = [];
        const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        const seatsPerRow = 12;

        for (const row of rowLabels) {
          for (let num = 1; num <= seatsPerRow; num++) {
            let type: "REGULAR" | "PREMIUM" | "VIP" = "REGULAR";
            if (row === "I" || row === "J") type = "VIP";
            else if (row === "G" || row === "H") type = "PREMIUM";

            seats.push({
              id: `seat-${cinemaIdx}-${s}-${row}${num}`,
              row,
              number: num,
              type,
            });
          }
        }

        screens.push({ id: screenId, name: `Screen ${s + 1}`, seats });
      }

      cinemas.push({
        id: `cinema-${cinemaIdx}`,
        name: `${chain} ${suffix}`,
        city: cityInfo.city,
        state: cityInfo.state,
        address: `${addr}, ${cityInfo.city}`,
        latitude: cityInfo.lat + latOffset,
        longitude: cityInfo.lng + lngOffset,
        screens,
      });

      cinemaIdx++;
    }
  }

  return cinemas;
}


let _cinemas: Cinema[] | null = null;
export function getCinemas(): Cinema[] {
  if (!_cinemas) _cinemas = buildCinemas();
  return _cinemas;
}




const bookedSeatsMap = new Map<string, Set<string>>();

export function getBookedSeats(showtimeId: string): Set<string> {
  if (!bookedSeatsMap.has(showtimeId)) {
    bookedSeatsMap.set(showtimeId, new Set());
  }
  return bookedSeatsMap.get(showtimeId)!;
}

export function bookSeats(showtimeId: string, seatIds: string[]) {
  const set = getBookedSeats(showtimeId);
  for (const id of seatIds) set.add(id);
}

export function generateShowtimes(movieId: string, userLat?: number, userLng?: number): CinemaShowtime[] {
  const cinemas = getCinemas();
  const rng = seededRandom(parseInt(movieId.replace(/\D/g, '').slice(0, 8)) || 12345);
  const showtimes: CinemaShowtime[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const cinema of cinemas) {
    for (const screen of cinema.screens) {
      const times = [10, 14, 18, 21];

      for (let day = 0; day < 5; day++) {

        const dayTimes = times.filter(() => rng() > 0.3);

        for (const hour of dayTimes) {
          const startTime = new Date(today);
          startTime.setDate(startTime.getDate() + day);
          startTime.setHours(hour, 0, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 150);

          const showtimeId = `st-${cinema.id}-${screen.id}-${day}-${hour}`;


          const bookedSet = getBookedSeats(showtimeId);
          if (bookedSet.size === 0) {

            const bookRate = 0.15 + rng() * 0.25;
            for (const seat of screen.seats) {
              if (rng() < bookRate) {
                bookedSet.add(seat.id);
              }
            }
          }

          const seatStatuses = Array.from(bookedSet).map(seatId => ({
            seatId,
            status: "BOOKED" as const,
          }));

          showtimes.push({
            id: showtimeId,
            movieId,
            cinemaId: cinema.id,
            screenId: screen.id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            basePrice: 200 + Math.floor(rng() * 100),
            premiumPrice: 350 + Math.floor(rng() * 100),
            vipPrice: 500 + Math.floor(rng() * 150),
            screen: {
              id: screen.id,
              name: screen.name,
              seats: screen.seats,
              theatre: {
                id: cinema.id,
                name: cinema.name,
                address: cinema.address,
                city: cinema.city,
              },
            },
            seatStatuses,
          });
        }
      }
    }
  }


  if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
    showtimes.sort((a, b) => {
      const cinemaA = cinemas.find(c => c.id === a.cinemaId)!;
      const cinemaB = cinemas.find(c => c.id === b.cinemaId)!;
      const distA = Math.sqrt(Math.pow(cinemaA.latitude - userLat, 2) + Math.pow(cinemaA.longitude - userLng, 2));
      const distB = Math.sqrt(Math.pow(cinemaB.latitude - userLat, 2) + Math.pow(cinemaB.longitude - userLng, 2));
      return distA - distB;
    });
  }


  return showtimes.slice(0, 40);
}
