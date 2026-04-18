import Link from "next/link";
import { ArrowRight, Ticket, Hotel, MapPin, Star, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#fdfbf7]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Immersive Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2500&auto=format&fit=crop" 
            alt="Luxury resort and travel" 
            className="w-full h-full object-cover"
          />
          {/* Elegant Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl pt-20">
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-white mb-6 leading-tight italic">
            Your Journey.<br />
            Our World.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
            The premium platform designed for travelers and entertainment seekers. 
            Discover luxury stays, epic movies, and unique experiences all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/hotels" className="btn-white text-[#183e29] w-full sm:w-auto text-lg px-8 py-4">
              Explore Hotels <ArrowRight size={20} />
            </Link>
            <Link href="/movies" className="btn-outline-white w-full sm:w-auto text-lg px-8 py-4">
              Now Showing
            </Link>
          </div>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-20">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.44,103.9,81.3,153.2,70.5,207.18,58.74,261.31,67.6,321.39,56.44Z"
              fill="#fdfbf7"
            ></path>
          </svg>
        </div>
      </section>

      {/* Categories / Destinations Section */}
      <section className="py-24 px-4 page-container">
        <div className="text-center mb-16">
          <h2 className="section-title italic">Featured Categories</h2>
          <p className="section-subtitle">Curated experiences for the discerning traveler.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/hotels" className="group block">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" 
                alt="Luxury Hotels" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-[#183e29] shadow-lg">
                  <Hotel size={24} />
                </div>
                <h3 className="text-2xl font-serif text-white font-bold mb-2">Luxury Hotels</h3>
                <p className="text-white/80 text-sm flex items-center justify-between">
                  Explore stays <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>
          </Link>

          <Link href="/movies" className="group block">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800" 
                alt="Cinema & Movies" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-[#183e29] shadow-lg">
                  <Ticket size={24} />
                </div>
                <h3 className="text-2xl font-serif text-white font-bold mb-2">Cinema & Movies</h3>
                <p className="text-white/80 text-sm flex items-center justify-between">
                  Book tickets <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>
          </Link>

          <Link href="/search" className="group block md:hidden lg:block">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800" 
                alt="Popular Destinations" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-[#183e29] shadow-lg">
                  <MapPin size={24} />
                </div>
                <h3 className="text-2xl font-serif text-white font-bold mb-2">Destinations</h3>
                <p className="text-white/80 text-sm flex items-center justify-between">
                  Discover cities <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Info / Value Prop Section */}
      <section className="bg-[#183e29] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="page-container relative z-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 italic text-white">Experience<br />The Extraordinary.</h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-md font-sans">
                OmniBook is the exclusive booking membership designed for those who want more from their travels and entertainment. 
                Seamlessly secure your spots from high-end resorts to IMAX premieres, all beautifully integrated in one place.
              </p>
              <ul className="space-y-4 mb-8 font-sans">
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Star size={16} className="text-[#c4a962]" />
                  </div>
                  Curated 5-Star Hotel Partners
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Ticket size={16} className="text-[#c4a962]" />
                  </div>
                  Premium Theatrical Showings
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar size={16} className="text-[#c4a962]" />
                  </div>
                  Real-time Availability Guarantee
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#c4a962] to-transparent rounded-[2rem] transform translate-x-4 translate-y-4"></div>
              <img 
                src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800" 
                alt="Travel experience" 
                className="relative z-10 w-full h-[500px] object-cover rounded-[2rem] shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-4 bg-[#f0eee5]">
        <div className="page-container max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Join OmniBook Elite</h2>
          <p className="text-zinc-600 mb-8 font-sans text-lg">
            Sign up to receive curated travel recommendations and priority booking access straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="input-field flex-1 !border-zinc-300"
            />
            <button className="btn-primary sm:w-auto w-full">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
