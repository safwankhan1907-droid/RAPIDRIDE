"use client";

import React, { useState } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../components/LiveMap"), { ssr: false });

export default function Home() {
  const { isSignedIn } = useUser();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err: any) {
      setError("Failed to initiate ride booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07080a] text-zinc-100 p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Glow Effects Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-5 mb-8 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg shadow-indigo-500/20 text-lg tracking-wider">
            R
          </div>
          <span className="text-xl font-bold tracking-widest bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            RAPIDRIDE
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium tracking-wide">Stripe Live</span>
          </div>

          {isSignedIn ? (
            <div className="border border-zinc-700/60 rounded-full p-1 bg-zinc-900/60 shadow-inner">
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Booking Card */}
        <div className="bg-[#0f1117]/80 backdrop-blur-xl border border-zinc-800/80 p-7 rounded-3xl shadow-2xl shadow-black/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold tracking-widest text-zinc-300 uppercase">Book Your Ride</h2>
              <span className="text-[10px] font-mono tracking-wider bg-zinc-900 text-indigo-400 border border-indigo-900/40 px-3 py-1 rounded-md">
                SECURE STRIPE PAY
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium tracking-wider text-zinc-400 mb-1.5 uppercase">
                  Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kat Kat Gate..."
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-[#07080a] border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium tracking-wider text-zinc-400 mb-1.5 uppercase">
                  Dropoff Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Roshan Gate..."
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-[#07080a] border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800/60">
            {isSignedIn ? (
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 active:scale-[0.99]"
              >
                <span className="tracking-wide uppercase text-sm">{loading ? "Processing..." : "Pay with Stripe"}</span>
                <span className="bg-zinc-950/10 px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold">₹345</span>
              </button>
            ) : (
              <div className="text-center">
                <p className="text-xs text-rose-400 mb-3 bg-rose-950/30 border border-rose-900/40 py-2 rounded-xl">
                  ⚠️ Unauthorized. Please login to book a ride.
                </p>
                <SignInButton mode="modal">
                  <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition border border-zinc-700/60">
                    Login to Book Ride
                  </button>
                </SignInButton>
              </div>
            )}

            {error && <p className="text-xs text-rose-400 mt-3 text-center">{error}</p>}
          </div>
        </div>

        {/* Live Fleet Radar Map Card */}
        <div className="bg-[#0f1117]/80 backdrop-blur-xl border border-zinc-800/80 p-7 rounded-3xl shadow-2xl shadow-black/50 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold tracking-widest text-zinc-300 uppercase">Live Fleet Radar</h2>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          </div>
          <div className="flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-zinc-800/80 relative shadow-inner">
            <MapComponent />
          </div>
        </div>
      </div>
    </main>
  );
}
