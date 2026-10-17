"use client";

import React, { useState, useEffect } from "react";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

const MapComponent = dynamic(() => import("../components/LiveMap"), { ssr: false });

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

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
    } catch (e) {}
  };

  const calculateDynamicFare = (p: string, d: string) => {
    if (!p || !d) return 345;
    const inputHash =
      (p.length + d.length) * 13 + (p.charCodeAt(0) || 10) + (d.charCodeAt(0) || 10);
    const estimatedKm = Math.min(Math.max((inputHash % 27) + 4, 4), 30);
    return Math.round(50 + estimatedKm * 19);
  };

  const dynamicFare = calculateDynamicFare(pickup, dropoff);

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
    };

    handleStripeReturn();
  }, [user]);

  const handleBooking = async () => {
    playSound("click");
    if (!pickup || !dropoff) {
      setError("Please enter both locations");
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#06040c] flex items-center justify-center text-purple-300 font-mono text-sm">
        Loading RapidRide...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen text-purple-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/rapidride-hero-bg.png"
            alt="RapidRide Background"
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-[#06040c]/70 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 max-w-md w-full bg-[#0e0a17]/90 border border-purple-500/40 p-8 rounded-3xl shadow-2xl shadow-purple-950/80 text-center backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-white font-black flex items-center justify-center rounded-2xl shadow-lg shadow-rose-500/40 text-2xl tracking-wider">
            R
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-2">
            RAPIDRIDE
          </h1>
          <p className="text-xs font-mono text-purple-300/80 mb-8 uppercase tracking-wid
