"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, ChevronRight } from "lucide-react";
import { useLocationStore } from "@/store";

const INDIAN_CITIES = [
  { name: "Mumbai", state: "Maharashtra", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80" },
  { name: "Delhi", state: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80" },
  { name: "Bangalore", state: "Karnataka", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80" },
  { name: "Hyderabad", state: "Telangana", image: "https://images.unsplash.com/photo-1572883454114-efb8a9b13975?w=400&q=80" },
  { name: "Chennai", state: "Tamil Nadu", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80" },
  { name: "Kolkata", state: "West Bengal", image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=400&q=80" },
  { name: "Pune", state: "Maharashtra", image: "https://images.unsplash.com/photo-1609947017136-9dba46212397?w=400&q=80" },
  { name: "Ahmedabad", state: "Gujarat", image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=400&q=80" },
  { name: "Jaipur", state: "Rajasthan", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80" },
  { name: "Lucknow", state: "Uttar Pradesh", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80" },
  { name: "Goa", state: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80" },
  { name: "Chandigarh", state: "Chandigarh", image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80" },
];

export default function LocationPicker() {
  const { city, setCity, setCoords, openPicker, setOpenPicker } = useLocationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [detecting, setDetecting] = useState(false);

  
  useEffect(() => {
    if (openPicker) {
      setIsOpen(true);
      setOpenPicker(false);
    }
  }, [openPicker, setOpenPicker]);

  
  useEffect(() => {
    if (!city) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [city]);

  const filteredCities = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) return;
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords(latitude, longitude);

        
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "User-Agent": "OmniBook/1.0" } }
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            "Unknown";
          
          
          const matched = INDIAN_CITIES.find(
            (c) => detectedCity.toLowerCase().includes(c.name.toLowerCase())
          );
          setCity(matched?.name || detectedCity);
        } catch {
          setCity("Mumbai"); 
        } finally {
          setDetecting(false);
          setIsOpen(false);
        }
      },
      () => {
        setDetecting(false);
        
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <><motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => city && setIsOpen(false)}
          /><motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[61] bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
          ><div className="p-6 pb-4 border-b border-zinc-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#183e29]/10 flex items-center justify-center">
                    <MapPin size={20} className="text-[#183e29]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold">Select Your City</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">To show movies & hotels near you</p>
                  </div>
                </div>
                {city && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                  >
                    <X size={16} className="text-zinc-500" />
                  </button>
                )}
              </div><button
                onClick={handleDetectLocation}
                disabled={detecting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#183e29]/5 hover:bg-[#183e29]/10 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#c4a962]/20 flex items-center justify-center flex-shrink-0">
                  {detecting ? (
                    <div className="w-4 h-4 border-2 border-[#c4a962] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Navigation size={16} className="text-[#c4a962]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#183e29]">
                    {detecting ? "Detecting your location..." : "Use my current location"}
                  </p>
                  <p className="text-xs text-zinc-400">Auto-detect via GPS</p>
                </div>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </button><div className="relative mt-3">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-[#183e29] focus:ring-1 focus:ring-[#183e29]/20 transition-all"
                  autoFocus
                />
              </div>
            </div><div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-2.5">
                {filteredCities.map((c) => (
                  <motion.button
                    key={c.name}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectCity(c.name)}
                    className={`relative overflow-hidden rounded-2xl aspect-[4/3] group ${
                      city === c.name ? "ring-2 ring-[#c4a962] ring-offset-2" : ""
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <p className="text-white text-sm font-semibold leading-tight">{c.name}</p>
                      <p className="text-white/60 text-[10px]">{c.state}</p>
                    </div>
                    {city === c.name && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#c4a962] flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              {filteredCities.length === 0 && (
                <p className="text-center text-sm text-zinc-400 py-8">
                  No cities found for &ldquo;{search}&rdquo;
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
