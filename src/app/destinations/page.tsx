"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sun, CloudRain, Snowflake, Leaf, Compass, Thermometer, CalendarRange, Users, Search, X, ArrowRight } from "lucide-react";
import { DestinationGridSkeleton, PulseLoader } from "@/components/SkeletonLoaders";

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  images: string[];
  tags: string[];
  bestMonths: number[];
  seasonType: string | null;
  attractions: string[];
  weather: string | null;
  peakSeason: string | null;
  culture: string | null;
}

const CATEGORIES = ["All", "Spring", "Summer", "Autumn", "Winter"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    destination: any;
    suggestions: any[];
  } | null>(null);


  const currentMonthIndex = new Date().getMonth() + 1;
  const currentMonthName = MONTHS[currentMonthIndex - 1];

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") {
        params.set("category", activeCategory);
      }
      
      const res = await fetch(`/api/destinations?${params.toString()}`);
      const data = await res.json();
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error(error);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = directQuery || searchQuery;
    
    if (!queryToSearch.trim()) {
      setSearchResult(null);
      return;
    }

    if (directQuery) {
      setSearchQuery(directQuery);
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/destinations/search?query=${encodeURIComponent(queryToSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      } else {
        setSearchResult({ destination: null, suggestions: [] });
      }
    } catch (error) {
      console.error(error);
      setSearchResult({ destination: null, suggestions: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
  };


  const recommendedDestinations = destinations.filter((d: any) => d.bestMonths.includes(currentMonthIndex));
  const otherDestinations = destinations.filter((d: any) => !d.bestMonths.includes(currentMonthIndex));

  const getSeasonIcon = (seasonType: string | null) => {
    if (!seasonType) return <Compass size={14} />;
    const lower = seasonType.toLowerCase();
    if (lower.includes("summer")) return <Sun size={14} className="text-yellow-400" />;
    if (lower.includes("winter")) return <Snowflake size={14} className="text-blue-300" />;
    if (lower.includes("monsoon") || lower.includes("rain")) return <CloudRain size={14} className="text-gray-300" />;
    if (lower.includes("spring") || lower.includes("autumn") || lower.includes("fall")) return <Leaf size={14} className="text-green-400" />;
    return <Compass size={14} />;
  };

  const renderDestinationCard = (dest: Destination, idx: number) => (
    <motion.div key={dest.id} variants={fadeUp} custom={idx} className="group h-[450px] perspective-1000">
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#c4a962]/20 transition-all duration-700">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 w-full h-full transform transition-transform duration-[1.5s] ease-out group-hover:scale-110">
          <img
            src={dest.images[0] || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800"}
            alt={dest.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          {dest.bestMonths.includes(currentMonthIndex) && (
            <span className="px-3 py-1 bg-[#c4a962]/90 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
              Best for {currentMonthName}
            </span>
          )}
          <span className="ml-auto px-2 py-1 bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-xs rounded-full flex items-center gap-1.5">
            {getSeasonIcon(dest.seasonType)}
            {dest.seasonType || "All Year"}
          </span>
        </div>

        {/* Default Content (Visible normally, fades out slightly on hover) */}
        <div className="absolute bottom-6 left-6 right-6 z-20 transition-all duration-500 transform group-hover:translate-y-4 group-hover:opacity-0">
          <div className="flex items-center gap-1.5 text-[#c4a962] text-sm font-medium mb-2">
            <MapPin size={14} />
            <span className="tracking-widest uppercase">{dest.country}</span>
          </div>
          <h3 className="text-4xl font-serif text-white font-bold italic leading-tight mb-2">
            {dest.name}
          </h3>
          <p className="text-white/80 text-sm line-clamp-2 font-sans">
            {dest.description}
          </p>
        </div>

        {/* Quick Facts Overlay (Visible on hover) */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-30 opacity-0 transform translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <h3 className="text-3xl font-serif text-white font-bold italic leading-tight mb-4 border-b border-white/20 pb-4">
            {dest.name}
          </h3>
          
          <div className="space-y-4 mb-6">
            {dest.weather && (
              <div className="flex items-start gap-3 text-white/90">
                <Thermometer size={16} className="text-[#c4a962] mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Average Weather</p>
                  <p className="text-sm font-medium">{dest.weather}</p>
                </div>
              </div>
            )}
            
            {dest.peakSeason && (
              <div className="flex items-start gap-3 text-white/90">
                <CalendarRange size={16} className="text-[#c4a962] mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Peak Season</p>
                  <p className="text-sm font-medium">{dest.peakSeason}</p>
                </div>
              </div>
            )}

            {dest.culture && (
              <div className="flex items-start gap-3 text-white/90">
                <Users size={16} className="text-[#c4a962] mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Culture & Vibe</p>
                  <p className="text-sm font-medium">{dest.culture}</p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleSearch(undefined, dest.name)}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium rounded-xl transition-colors z-50 relative"
          >
            Explore Destination
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#111111] min-h-screen">
      <section className="-mt-16 relative overflow-hidden py-32 md:py-48 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2500&auto=format&fit=crop"
            alt="World Map"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/60 to-[#111111]" />
        </div>
        
        <div className="relative z-10 page-container text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
              <Compass size={14} className="text-[#c4a962]" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-widest">Seasonal Discovery</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Find Your <span className="text-[#c4a962] italic">Next Escape</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-sans font-light">
              Explore curated destinations worldwide. From sun-drenched shores to snow-capped peaks, discover the perfect place for your next journey.
            </p>
            
            <form onSubmit={handleSearch} className="mt-10 relative max-w-xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={20} className="text-white/50 group-focus-within:text-[#c4a962] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Where to next? (e.g., Paris, Tokyo, New York)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#c4a962] focus:bg-white/20 transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-14 pr-2 flex items-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-[#c4a962] text-white px-6 rounded-full font-medium hover:bg-[#b09756] transition-colors"
              >
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <div className="page-container pb-24 -mt-10 relative z-20">
        {isSearching ? (
          <div className="bg-[#1a1a1a] rounded-3xl p-12 border border-white/10 shadow-2xl">
            <PulseLoader text="Searching across the globe..." />
          </div>
        ) : searchResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Search Result Main Destination */}
            {searchResult.destination ? (
              <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="h-[400px] lg:h-auto relative">
                    <img
                      src={searchResult.destination.imageUrl}
                      alt={searchResult.destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent lg:hidden" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1a1a1a] hidden lg:block" />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c4a962]/30 bg-[#c4a962]/10 mb-6 w-fit">
                      <MapPin size={14} className="text-[#c4a962]" />
                      <span className="text-xs font-medium text-[#c4a962] uppercase tracking-widest">Destination Found</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 italic">
                      {searchResult.destination.name}
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed mb-8 font-sans">
                      {searchResult.destination.description}
                    </p>
                    <button className="btn-primary w-fit flex items-center gap-2 group">
                      Plan a Trip to {searchResult.destination.name}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] rounded-3xl p-16 text-center border border-white/10 shadow-2xl">
                <Compass size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-3xl font-serif text-white mb-4 italic">Destination Not Found</h3>
                <p className="text-white/50 text-lg">We couldn't find detailed information for "{searchQuery}". Try searching for a major city or landmark.</p>
              </div>
            )}

            {/* Suggestions */}
            {searchResult.suggestions && searchResult.suggestions.length > 0 && (
              <div className="pt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-white/20 flex-1"></div>
                  <h3 className="text-2xl font-serif font-bold text-white px-4">
                    Places to Visit in & around {searchResult.destination?.name || searchQuery}
                  </h3>
                  <div className="h-px bg-white/20 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {searchResult.suggestions.map((suggestion: any, i: any) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      onClick={() => handleSearch(undefined, suggestion.name)}
                      className="group cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative h-[320px] rounded-[2rem] overflow-hidden mb-5 shadow-2xl shadow-black/50">
                        <img
                          src={suggestion.imageUrl}
                          alt={suggestion.name}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute bottom-5 left-5 right-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <h4 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-[#c4a962] transition-colors leading-tight drop-shadow-md">
                            {suggestion.name}
                          </h4>
                        </div>
                      </div>
                      <div className="px-2 flex-1">
                        <p className="text-white/60 text-sm line-clamp-3 font-sans leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-center pt-8">
              <button onClick={clearSearch} className="text-white/50 hover:text-white transition-colors underline underline-offset-4">
                Back to Discovery
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-12 pb-2">
              {CATEGORIES.map((cat: any) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-[#c4a962] text-white shadow-lg shadow-[#c4a962]/20"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <DestinationGridSkeleton count={6} />
            ) : destinations.length === 0 ? (
              <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10">
                <Compass size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-2xl font-serif text-white mb-2">No Destinations Found</h3>
                <p className="text-white/50">Try selecting a different category.</p>
              </div>
            ) : (
              <div className="space-y-24">
                {/* When "All" is selected, group destinations by Season */}
                {activeCategory === "All" ? (
                  <>
                    {CATEGORIES.filter((c: any) => c !== "All").map((season: any) => {
                      const seasonDestinations = destinations.filter((d: any) => 
                        d.seasonType?.toLowerCase() === season.toLowerCase() || 
                        d.tags?.includes(season)
                      );
                      
                      if (seasonDestinations.length === 0) return null;

                      return (
                        <div key={season}>
                          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                            {getSeasonIcon(season)}
                            <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                              {season} Discoveries
                            </h2>
                          </div>
                          <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                          >
                            {seasonDestinations.map((dest: any, i: any) => renderDestinationCard(dest, i))}
                          </motion.div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                      {getSeasonIcon(activeCategory)}
                      <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                        {activeCategory} Destinations
                      </h2>
                    </div>
                    
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      initial="hidden"
                      animate="visible"
                    >
                      {destinations.map((dest: any, i: any) => renderDestinationCard(dest, i))}
                    </motion.div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
