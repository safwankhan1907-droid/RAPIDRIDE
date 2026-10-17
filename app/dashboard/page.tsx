"use client";

import React, { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import RideHistory from "@/components/RideHistory";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [rides, setRides] = useState<any[]>([]);

  const fetchRides = async (userId: string) => {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formatted = data.map((r) => ({
        id: r.id,
        pickup: r.pickup_location,
        dropoff: r.dropoff_location,
        fare: r.fare,
        payment_id: r.payment_id,
        status: r.status,
        rating: r.rating,
        review: r.review,
      }));
      setRides(formatted);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRides(user.id);
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#06040c] flex items-center justify-center text-purple-300 font-mono text-sm">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen text-purple-100 p-6 md:p-10 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Background Layer matching your theme */}
      <div className="absolute inset-0 z-0">
        <img
          src="/rapidride-hero-bg.png"
          alt="Background"
          className="w-full h-full object-cover filter brightness-50"
        />
        <div className="absolute inset-0 bg-[#06040c]/80 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-purple-900/40 pb-5 mb-8 backdrop-blur-md px-6 rounded-2xl bg-black/40 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-white font-black px-3.5 py-1.5 rounded-xl shadow-lg text-lg tracking-wider">
            R
          </div>
          <span className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            RIDE HISTORY & RECEIPTS
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 px-4 py-2 rounded-xl text-xs font-mono text-purple-200 transition shadow-md"
          >
            ← Back to Home
          </Link>
          <div className="border border-purple-500/50 rounded-full p-1 bg-purple-950/60">
            <UserButton />
          </div>
        </div>
      </header>

      {/* Ride History / Records Component */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <RideHistory rides={rides} onRideUpdated={() => user && fetchRides(user.id)} />
      </div>
    </main>
  );
}