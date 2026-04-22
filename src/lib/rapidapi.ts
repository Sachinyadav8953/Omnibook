export const RAPIDAPI_HOST = "booking-com.p.rapidapi.com";

function getApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not set in environment variables");
  return key;
}


async function rapidFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`);
  
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': getApiKey(),
    },
    
    
    next: { revalidate: 3600 }, 
  });

  if (!res.ok) {
    throw new Error(`RapidAPI Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface RapidLocation {
  dest_id: string;
  dest_type: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export async function searchLocations(query: string) {
  
  return rapidFetch<any>('/v1/hotels/locations', {
    name: query,
    locale: 'en-us'
  });
}

export async function searchHotels(
  destId: string, 
  destType: string, 
  checkin: string, 
  checkout: string, 
  adults = "2",
  rooms = "1"
) {
  return rapidFetch<any>('/v1/hotels/search', {
    dest_id: destId,
    dest_type: destType,
    checkin_date: checkin,
    checkout_date: checkout,
    adults_number: adults,
    room_number: rooms,
    order_by: 'popularity',
    units: 'metric',
    filter_by_currency: 'INR',
    locale: 'en-us',
  });
}

export async function getHotelDetails(hotelId: string) {
  return rapidFetch<any>('/v1/hotels/data', {
    hotel_id: hotelId,
    locale: 'en-us',
  });
}

export async function getHotelPhotos(hotelId: string) {
  return rapidFetch<any>('/v1/hotels/photos', {
    hotel_id: hotelId,
    locale: 'en-us',
  });
}
