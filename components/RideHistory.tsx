'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'

interface Ride {
  id: string | number
  pickup: string
  dropoff: string
  fare: number
  created_at?: string
  status?: string
  rating?: number
  review?: string
}

interface RideHistoryProps {
  rides?: Ride[]
  onRideUpdated?: () => void
}

export default function RideHistory({ rides = [], onRideUpdated }: RideHistoryProps) {
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSaveReview = async () => {
    if (!selectedRide) return
    setSubmitting(true)

    const { error } = await supabase
      .from('rides')
      .update({ rating: rating, review: review })
      .eq('id', selectedRide.id)

    if (!error) {
      setSubmitting(false)
      setSelectedRide(null)
      if (onRideUpdated) onRideUpdated()
    } else {
      console.error('Error updating review:', error.message)
      setSubmitting(false)
    }
  }

  const safeRides = rides || []

  return (
    <div className="w-full p-6 bg-[#0f1117] rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
        <h3 className="text-xl font-light tracking-wide text-zinc-100">RIDE HISTORY & REVIEWS</h3>
        <span className="text-[10px] font-normal text-zinc-400 tracking-[0.2em] uppercase bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
          {safeRides.length} Rides
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
        {safeRides.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6 font-light">No rides booked yet.</p>
        ) : (
          safeRides.map((ride) => (
            <div
              key={ride.id}
              className="p-4 rounded-xl bg-[#090a0f] border border-zinc-800/60 flex items-center justify-between hover:border-zinc-700 transition"
            >
              <div className="flex flex-col gap-1 max-w-[65%]">
                <div className="text-xs font-medium text-zinc-200 truncate">
                  <span className="text-zinc-500 font-normal">From:</span> {ride.pickup}
                </div>
                <div className="text-xs font-medium text-zinc-200 truncate">
                  <span className="text-zinc-500 font-normal">To:</span> {ride.dropoff}
                </div>
                {ride.rating ? (
                  <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                    {'★'.repeat(ride.rating)} <span className="text-zinc-400 text-[10px]">({ride.rating}/5)</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-amber-500/80 mt-0.5">Not Rated Yet</span>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-emerald-400">₹{ride.fare}</span>
                <button
                  onClick={() => {
                    setSelectedRide(ride)
                    setRating(ride.rating || 5)
                    setReview(ride.review || '')
                  }}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition border border-zinc-700"
                >
                  {ride.rating ? 'View / Edit' : 'Rate & Receipt'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt & Review Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="receipt-modal"
            className="w-full max-w-md p-6 bg-[#0f1117] text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-light tracking-wide text-zinc-100">Trip Receipt & Review</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RapidRide Experience</p>
              </div>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                Paid via Stripe
              </span>
            </div>

            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Booking ID:</span>
                <span className="font-mono text-xs text-zinc-400">#{selectedRide.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pickup:</span>
                <span className="font-medium text-right text-zinc-200">{selectedRide.pickup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Dropoff:</span>
                <span className="font-medium text-right text-zinc-200">{selectedRide.dropoff}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400 font-medium">Amount Paid:</span>
                <span className="font-bold text-emerald-400 text-base">₹{selectedRide.fare}</span>
              </div>
            </div>

            {/* Rating & Review Input Section with Hover & Click Support */}
            <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Rate Your Ride</label>
              <div className="flex gap-2 text-2xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition transform hover:scale-110"
                  >
                    <span
                      className={
                        star <= (hoverRating || rating) ? 'text-amber-400' : 'text-zinc-700'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write your feedback about this ride..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#090a0f] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none h-16"
              />
              <button
                onClick={handleSaveReview}
                disabled={submitting}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs tracking-wider uppercase transition border border-zinc-700"
              >
                {submitting ? 'Saving...' : 'Submit Rating & Review'}
              </button>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedRide(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs transition border border-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
