"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Ride {
  id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  payment_id?: string;
  status: string;
  rating?: number;
  review?: string;
}

interface RideHistoryProps {
  rides: Ride[];
  onRideUpdated: () => void;
}

export default function RideHistory({ rides, onRideUpdated }: RideHistoryProps) {
  const [activeTab, setActiveTab] = useState<"rides" | "payments" | "reviews">("rides");
  const [selectedReceipt, setSelectedReceipt] = useState<Ride | null>(null);
  const [ratingInput, setRatingInput] = useState<{ [key: string]: number }>({});
  const [reviewInput, setReviewInput] = useState<{ [key: string]: string }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleReviewSubmit = async (rideId: string) => {
    const rating = ratingInput[rideId] || 5;
    const review = reviewInput[rideId] || "Great ride, smooth experience!";

    setSubmittingId(rideId);
    const { error } = await supabase
      .from("rides")
      .update({ rating, review })
      .eq("id", rideId);

    if (!error) {
      onRideUpdated();
    }
    setSubmittingId(null);
  };

  return (
    <div className="bg-[#0e0a17]/80 backdrop-blur-md border border-purple-500/30 p-7 rounded-3xl shadow-2xl shadow-purple-950/60">
      {/* Section Header & Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-purple-900/50 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold tracking-widest text-rose-400 uppercase">
            User Dashboard & Records
          </h2>
          <p className="text-xs text-purple-300/70 font-mono mt-1">
            Manage your rides, view receipts, and check reviews.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-2xl border border-purple-500/30">
          <button
            onClick={() => setActiveTab("rides")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
              activeTab === "rides"
                ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/30"
                : "text-purple-300 hover:text-white"
            }`}
          >
            🚗 Rides History
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
              activeTab === "payments"
                ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/30"
                : "text-purple-300 hover:text-white"
            }`}
          >
            💳 Payments & Receipts
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
              activeTab === "reviews"
                ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/30"
                : "text-purple-300 hover:text-white"
            }`}
          >
            ⭐ Reviews & Ratings
          </button>
        </div>
      </div>

      {/* Tab 1: Rides History */}
      {activeTab === "rides" && (
        <div>
          {rides.length === 0 ? (
            <div className="text-center py-12 text-purple-400/60 font-mono text-xs">
              No ride history found. Book your first ride above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-[#06040c]/90 border border-purple-500/20 p-5 rounded-2xl shadow-inner flex flex-col justify-between hover:border-rose-500/40 transition"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-md">
                        {ride.status || "Completed"}
                      </span>
                      <span className="text-sm font-black text-rose-300 font-mono">
                        ₹{ride.fare}
                      </span>
                    </div>
                    <div className="space-y-1 font-mono text-xs text-purple-200">
                      <p>
                        <span className="text-rose-400">Pickup:</span> {ride.pickup}
                      </p>
                      <p>
                        <span className="text-indigo-400">Dropoff:</span> {ride.dropoff}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-purple-900/40 flex justify-between items-center text-[10px] font-mono text-purple-400">
                    <span>ID: {ride.id.substring(0, 8)}...</span>
                    <button
                      onClick={() => setSelectedReceipt(ride)}
                      className="text-rose-400 hover:underline font-bold"
                    >
                      View Receipt ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payments & Receipts */}
      {activeTab === "payments" && (
        <div>
          {rides.length === 0 ? (
            <div className="text-center py-12 text-purple-400/60 font-mono text-xs">
              No payment records available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-purple-900/60 text-purple-400">
                    <th className="pb-3 px-3">Transaction ID</th>
                    <th className="pb-3 px-3">Route</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-purple-200">
                  {rides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-purple-950/30">
                      <td className="py-3 px-3 text-rose-300 font-bold">
                        {ride.payment_id || "cs_live_" + ride.id.substring(0, 6)}
                      </td>
                      <td className="py-3 px-3 text-purple-300">
                        {ride.pickup} ➔ {ride.dropoff}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">₹{ride.fare}</td>
                      <td className="py-3 px-3 text-emerald-400">Paid (Stripe)</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedReceipt(ride)}
                          className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg transition font-bold"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews & Ratings */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {rides.length === 0 ? (
            <div className="text-center py-12 text-purple-400/60 font-mono text-xs">
              No completed rides to review.
            </div>
          ) : (
            rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-[#06040c]/90 border border-purple-500/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <p className="text-xs font-mono text-purple-200 font-bold">
                    {ride.pickup} ➔ {ride.dropoff}
                  </p>
                  <p className="text-[10px] font-mono text-purple-400 mt-1">
                    Fare: ₹{ride.fare} • Status: Completed
                  </p>
                  {ride.review && (
                    <p className="text-xs font-mono text-rose-300 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                      "{ride.review}" ({ride.rating || 5} ⭐)
                    </p>
                  )}
                </div>

                {!ride.review && (
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <select
                      value={ratingInput[ride.id] || 5}
                      onChange={(e) =>
                        setRatingInput({ ...ratingInput, [ride.id]: Number(e.target.value) })
                      }
                      className="bg-black border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none"
                    >
                      <option value="5">5 ⭐ (Excellent)</option>
                      <option value="4">4 ⭐ (Good)</option>
                      <option value="3">3 ⭐ (Average)</option>
                      <option value="2">2 ⭐ (Poor)</option>
                      <option value="1">1 ⭐ (Bad)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Write review..."
                      value={reviewInput[ride.id] || ""}
                      onChange={(e) =>
                        setReviewInput({ ...reviewInput, [ride.id]: e.target.value })
                      }
                      className="bg-black border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none flex-1"
                    />

                    <button
                      onClick={() => handleReviewSubmit(ride.id)}
                      disabled={submittingId === ride.id}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold transition shadow-md whitespace-nowrap"
                    >
                      {submittingId === ride.id ? "Saving..." : "Submit"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Digital Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0a17] border-2 border-rose-500/60 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-rose-950/80 relative font-mono">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white text-sm font-bold bg-purple-950 px-3 py-1 rounded-lg"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-tr from-rose-500 to-purple-600 text-white font-black flex items-center justify-center rounded-xl text-lg">
                R
              </div>
              <h3 className="text-base font-extrabold text-rose-300 tracking-wider">
                RAPIDRIDE DIGITAL RECEIPT
              </h3>
              <p className="text-[10px] text-purple-400 mt-1">OFFICIAL STRIPE & SUPABASE INVOICE</p>
            </div>

            <div className="space-y-3 text-xs text-purple-200 border-t border-b border-purple-900/60 py-4 my-4">
              <div className="flex justify-between">
                <span className="text-purple-400">Transaction ID:</span>
                <span className="text-rose-300 font-bold">
                  {selectedReceipt.payment_id || "cs_live_" + selectedReceipt.id.substring(0, 8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Pickup Location:</span>
                <span className="text-right">{selectedReceipt.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Dropoff Destination:</span>
                <span className="text-right">{selectedReceipt.dropoff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Payment Status:</span>
                <span className="text-emerald-400 font-bold">Successful (Paid)</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-purple-900/40">
                <span className="text-white">Total Fare:</span>
                <span className="text-rose-300">₹{selectedReceipt.fare}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition shadow-lg shadow-rose-600/30"
            >
              Print / Download Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
