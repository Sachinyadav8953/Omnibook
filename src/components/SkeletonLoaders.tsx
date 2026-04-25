"use client";

import { motion } from "framer-motion";


function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton-shimmer rounded-xl ${className}`} />
  );
}


export function MovieCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <Shimmer className="aspect-[2/3] !rounded-2xl" />
      <div className="space-y-2 px-0.5">
        <Shimmer className="h-4 w-3/4 !rounded-lg" />
        <Shimmer className="h-3 w-1/2 !rounded-lg" />
      </div>
    </div>
  );
}


export function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <MovieCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}


export function HotelCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <Shimmer className="h-52 !rounded-none" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-5 w-2/3 !rounded-lg" />
        <Shimmer className="h-3 w-1/2 !rounded-lg" />
        <div className="flex gap-1.5">
          <Shimmer className="h-6 w-14 !rounded-full" />
          <Shimmer className="h-6 w-14 !rounded-full" />
          <Shimmer className="h-6 w-14 !rounded-full" />
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-zinc-100">
          <Shimmer className="h-4 w-16 !rounded-lg" />
          <div className="text-right space-y-1">
            <Shimmer className="h-5 w-16 !rounded-lg ml-auto" />
            <Shimmer className="h-3 w-12 !rounded-lg ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}


export function HotelGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <HotelCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}


export function DetailHeroSkeleton() {
  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden -mt-20 animate-pulse">
      <Shimmer className="w-full h-full !rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 page-container pb-8 space-y-3">
        <div className="flex gap-2">
          <Shimmer className="h-6 w-12 !rounded-full" />
          <Shimmer className="h-6 w-16 !rounded-full" />
        </div>
        <Shimmer className="h-10 w-2/3 !rounded-xl" />
        <Shimmer className="h-4 w-1/3 !rounded-lg" />
      </div>
    </div>
  );
}


export function PulseLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-[#c4a962]/20" />
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-[#c4a962] absolute inset-0 animate-spin" />
        <div className="w-6 h-6 rounded-full bg-[#c4a962]/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-sm text-zinc-400 animate-pulse">{text}</p>
    </div>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="relative h-[400px] rounded-2xl overflow-hidden animate-pulse">
      <Shimmer className="w-full h-full !rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <Shimmer className="h-6 w-3/4 !rounded-lg" />
        <Shimmer className="h-4 w-1/2 !rounded-lg" />
        <div className="flex gap-2 mt-2">
          <Shimmer className="h-5 w-16 !rounded-full" />
          <Shimmer className="h-5 w-16 !rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DestinationGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
        >
          <DestinationCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
