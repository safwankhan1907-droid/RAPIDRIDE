"use client";

import React, { useState } from "react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// Leaflet map dynamic import to avoid SSR errors
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function Home() {
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
    <main className="min-h-screen bg-[#0a0a0c] text-white p-6">
      {/* Header with Branding and Clerk Auth */}
      <header className="flex items-center justify-between border-b border-gray-800 pb-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-black font-extrabold px-3 py-1 rounded text-lg">R</div>
          <span className="text-xl font-bold tracking-wider">RAPIDRIDE</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-medium">
            Stripe Live Mode Active
          </span>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Section */}
        <div className="bg-[#121216] border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">BOOK YOUR CAB</h2>
            <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded">STRIPE PAY</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">PICKUP LOCATION</label>
              <input
                type="text"
                placeholder="e.g., Kat Kat Gate..."
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-[#1a1a20] border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">DROPOFF DESTINATION</label>
              <input
                type="text"
                placeholder="e.g., Roshan Gate..."
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-[#1a1a20] border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <SignedIn>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3.5 rounded-xl transition mt-4 flex items-center justify-center space-x-2"
              >
                <span>{loading ? "Processing..." : "PAY WITH STRIPE"}</span>
                <span className="text-emerald-600 font-bold">₹345</span>
              </button>
            </SignedIn>

            <SignedOut>
              <div className="text-center pt-2">
                <p className="text-xs text-red-400 mb-2">Error: Unauthorized. Please login to book a ride</p>
                <SignInButton mode="modal">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition">
                    Login to Book Ride
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
          </div>
        </div>

        {/* Live Fleet Radar Map Section */}
        <div className="bg-[#121216] border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <h2 className="text-lg font-semibold mb-4">LIVE FLEET RADAR</h2>
          <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-gray-800 relative">
            <MapComponent />
          </div>
        </div>
      </div>

      {/* Ride History & Reviews */}
      <div className="mt-8 bg-[#121216] border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">RIDE HISTORY & REVIEWS</h2>
          <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded">8 RIDES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a20] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">From: kat kat gate</p>
              <p className="text-xs text-gray-400">To: roshan gate</p>
              <p className="text-xs text-amber-400 mt-1">Not Rated Yet</p>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">₹300</span>
              <button className="block mt-2 bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition">
                Rate & Receipt
              </button>
            </div>
          </div>
          <div className="bg-[#1a1a20] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">From: kat kat gate</p>
              <p className="text-xs text-gray-400">To: roshan gate</p>
              <p className="text-xs text-amber-400 mt-1">Not Rated Yet</p>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">₹300</span>
              <button className="block mt-2 bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition">
                Rate & Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
