"use client";

import React, { useState, useEffect } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import RideHistory from "../components/RideHistory";
import { supabase } from "@/utils/supabase/client";

const MapComponent = dynamic(() => import("../components/LiveMap"), { ssr: false });

export default function Home() {
  const { user, isSignedIn } = useUser();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rides, setRides] = useState<any[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Safe Web Audio Bleep Generator
  const playSound = (type: "success" | "click" | "booking") => {
    try {
      const windowAudio = window as any;
      const AudioCtx = windowAudio.AudioContext || windowAudio.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      } else if (type === "click") {
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } else {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      }
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Ignore if browser blocks audio
    }
  };

  const calculateDynamicFare = (p: string, d: string) => {
    if (!p || !d) return 345;
    const inputHash =
      (p.length + d.length) * 13 + (p.charCodeAt(0) || 10) + (d.charCodeAt(0) || 10);
    const estimatedKm = Math.min(Math.max((inputHash % 27) + 4, 4), 30);
    return Math.round(50 + estimatedKm * 19);
  };

  const dynamicFare = calculateDynamicFare(pickup, dropoff);

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
    if (!user) return;

    const handleStripeReturn = async () => {
      const query = new URLSearchParams(window.location.search);
      const isSuccess = query.get("success");

      if (isSuccess === "true") {
        playSound("success");
        setToast({
          message: "Payment successful! Ride booked & synced.",
          type: "success",
        });

        const p = query.get("pickup") || "Kat Kat Gate";
        const d = query.get("dropoff") || "Roshan Gate";
        const f = query.get("fare") || "345";

        const { error: insertError } = await supabase.from("rides").insert([
          {
            user_id: user.id,
            user_email: user.primaryEmailAddress?.emailAddress || "",
            pickup_location: p,
            dropoff_location: d,
            fare: Number(f),
            status: "Completed",
            is_paid: true,
            payment_id: "cs_live_" + Math.random().toString(36).substring(2, 15),
          },
        ]);

        if (!insertError) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      await fetchRides(user.id);
    };

    handleStripeReturn();
  }, [user]);

  const handleBooking = async () => {
    playSound("click");
    if (!pickup || !dropoff) {
      setError("Please enter both pickup and dropoff locations");
      setToast({ message: "Please fill in both pickup and dropoff locations!", type: "error" });
      return;
    }
    try {
      setLoading(true);
      setError("");
      playSound("booking");
      setToast({
        message: "Redirecting to secure Stripe checkout...",
        type: "info",
      });

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff, fare: dynamicFare }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong");
        setToast({ message: data.error || "Something went wrong", type: "error" });
      }
    } catch (err: any) {
      setError("Failed to initiate ride booking");
      setToast({ message: "Failed to initiate ride booking", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-purple-100 p-6 md:p-10 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      
      {/* Prominent Top-Center Floating Toast Banner */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-3 bg-[#160d26] border-2 border-rose-500 px-6 py-3.5 rounded-2xl shadow-2xl shadow-rose-950/80 animate-bounce">
          <span className="text-xl">
            {toast.type === "success" && "✅"}
            {toast.type === "error" && "❌"}
            {toast.type === "info" && "ℹ️"}
          </span>
          <p className="text-xs md:text-sm font-mono font-bold text-rose-200 tracking-wider">
            {toast.message}
          </p>
          <button
            onClick={() => setToast(null)}
            className="ml-4 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/rapidride-hero-bg.png"
          alt="RapidRide Anime Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#06040c]/40" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-purple-900/40 pb-5 mb-8 backdrop-blur-md px-4 rounded-2xl bg-black/30">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-white font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-rose-500/30 text-lg tracking-wider">
            R
          </div>
          <span className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            RAPIDRIDE
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-purple-950/60 border border-rose-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs text-rose-300 font-mono tracking-wider font-semibold">
              RATE: ₹19/KM
            </span>
          </div>

          {isSignedIn ? (
            <div className="border border-purple-500/50 rounded-full p-1 bg-purple-950/60 shadow-inner backdrop-blur-md">
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98]">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-10">
        {/* Booking Card */}
        <div className="bg-[#0e0a17]/70 backdrop-blur-md border border-purple-500/30 p-7 rounded-3xl shadow-2xl shadow-purple-950/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
                Book Your Ride
              </h2>
              <span className="text-[10px] font-mono tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-md">
                SECURE STRIPE PAY
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono tracking-wider text-purple-300/80 mb-1.5 uppercase">
                  Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kat Kat Gate..."
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-[#06040c]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-purple-100 placeholder-purple-900 focus:outline-none focus:border-rose-500 transition shadow-inner backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider text-purple-300/80 mb-1.5 uppercase">
                  Dropoff Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Roshan Gate..."
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-[#06040c]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-purple-100 placeholder-purple-900 focus:outline-none focus:border-rose-500 transition shadow-inner backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-purple-900/50">
            {isSignedIn ? (
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-purple-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-60"
              >
                <span className="tracking-widest uppercase text-sm">
                  {loading ? "Processing..." : "Pay with Stripe"}
                </span>
                <span className="bg-black/20 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold text-rose-200">
                  {pickup && dropoff ? `₹${dynamicFare}` : "Enter Locations"}
                </span>
              </button>
            ) : (
              <div className="text-center">
                <p className="text-xs text-rose-300 mb-3 bg-rose-950/70 border border-rose-500/30 py-2.5 rounded-xl font-medium backdrop-blur-sm">
                  ⚠️ Unauthorized. Please login to book a ride.
                </p>
                <SignInButton mode="modal">
                  <button className="w-full bg-purple-950/80 hover:bg-purple-900 text-rose-300 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition border border-rose-500/30 shadow-lg backdrop-blur-sm">
                    Login to Book Ride
                  </button>
                </SignInButton>
              </div>
            )}

            {error && <p className="text-xs text-rose-400 mt-3 text-center">{error}</p>}
          </div>
        </div>

        {/* Live Fleet Radar Map Card */}
        <div className="bg-[#0e0a17]/70 backdrop-blur-md border border-purple-500/30 p-7 rounded-3xl shadow-2xl shadow-purple-950/50 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
              Live Fleet Radar
            </h2>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-purple-500/30 relative shadow-inner backdrop-blur-sm">
            <MapComponent />
          </div>
        </div>
      </div>

      {/* Ride History */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <RideHistory rides={rides} onRideUpdated={() => user && fetchRides(user.id)} />
      </div>
    </main>
  );
}
