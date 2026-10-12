"use client";

import React, { useState } from "react";

interface RideHistoryProps {
  rides: any[];
  onRideUpdated: () => void;
}

export default function RideHistory({ rides, onRideUpdated }: RideHistoryProps) {
  const [selectedRideForReview, setSelectedRideForReview] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRideForReview) return;

    try {
      setSubmitting(true);
      // Direct update via fetch API or supabase if available
      const res = await fetch("/api/update-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId: selectedRideForReview.id,
          rating,
          review: reviewText,
        }),
      });

      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
      setSelectedRideForReview(null);
      setReviewText("");
      onRideUpdated();
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0e0a17]/85 backdrop-blur-xl border border-purple-500/30 p-7 rounded-3xl shadow-2xl shadow-purple-950/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">Recent Ride History & Reviews</h2>
        <span className="text-[10px] font-mono tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-md">
          SECURE DB SYNC
        </span>
      </div>

      {successToast && (
        <div className="mb-6 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono tracking-wider flex items-center space-x-2 backdrop-blur-sm">
          <span>✅ Review submitted successfully! Thank you for rating your RapidRide trip.</span>
        </div>
      )}

      {rides.length === 0 ? (
        <div className="text-center py-10 bg-[#06040c]/50 rounded-2xl border border-purple-500/20">
          <p className="text-xs font-mono text-purple-300">No past rides found. Book your first trip above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-[#06040c]/85 border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between transition hover:border-rose-500/50 backdrop-blur-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                    ID: {ride.id.substring(0, 8)}
                  </span>
                  <span className="text-sm font-black text-rose-400 font-mono">₹{ride.fare}</span>
                </div>

                <div className="space-y-2 mb-4 text-xs font-mono">
                  <div className="flex items-center space-x-2 text-purple-200 truncate">
                    <span className="text-rose-400">📍</span>
                    <span className="truncate">From: {ride.pickup}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-200 truncate">
                    <span className="text-indigo-400">🏁</span>
                    <span className="truncate">To: {ride.dropoff}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-900/50 flex items-center justify-between">
                {ride.rating ? (
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-mono">
                    <span>{"★".repeat(ride.rating)}</span>
                    <span className="text-purple-300 ml-1">({ride.rating}/5)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedRideForReview(ride)}
                    className="bg-purple-950 hover:bg-purple-900 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Rate Trip
                  </button>
                )}
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {ride.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedRideForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0a17] border border-purple-500/40 p-6 rounded-3xl max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-mono font-bold tracking-widest text-rose-400 uppercase mb-4">
              Rate Your RapidRide Driver
            </h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex justify-center space-x-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none transition transform hover:scale-110"
                  >
                    {star <= rating ? "⭐" : "⚪"}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider text-purple-300 mb-1.5 uppercase">
                  Write a Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was your ride experience?"
                  className="w-full bg-[#06040c] border border-purple-500/30 rounded-xl p-3 text-xs text-purple-100 placeholder-purple-900 focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRideForReview(null)}
                  className="flex-1 bg-purple-950 hover:bg-purple-900 text-purple-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider border border-purple-500/30 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/30"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
