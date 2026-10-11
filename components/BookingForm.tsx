'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useUser } from '@clerk/nextjs'

export default function BookingForm({ onRideBooked }: { onRideBooked?: () => void }) {
  const { user } = useUser()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [fare, setFare] = useState(250)

  const handleLocationChange = (newPickup: string, newDropoff: string) => {
    if (newPickup && newDropoff) {
      const calculatedFare = Math.min(Math.max((newPickup.length + newDropoff.length) * 15, 180), 850)
      setFare(calculatedFare)
    }
  }

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickup || !dropoff) {
      setMessage('Please fill in both pickup and dropoff locations.')
      return
    }

    setLoading(true)
    setMessage('Connecting to Stripe Checkout...')

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          fare,
          userId: user ? user.id : 'guest_user',
          userEmail: user?.primaryEmailAddress?.emailAddress || 'guest@rapidride.com'
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url // Redirects user to Stripe Payment page
      } else {
        setMessage('Error: ' + (data.error || 'Failed to create checkout session'))
        setLoading(false)
      }
    } catch (err: any) {
      setMessage('Error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full p-6 bg-[#0f1117] rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-2xl">
      <form onSubmit={handleStripeCheckout} className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-light tracking-wide text-zinc-100">BOOK YOUR CAB</h3>
          <span className="text-[10px] font-normal text-zinc-400 tracking-[0.2em] uppercase bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">STRIPE PAY</span>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-normal text-zinc-400 uppercase tracking-[0.2em]">Pickup Location</label>
          <input
            type="text"
            placeholder="e.g., Kat Kat Gate..."
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value)
              handleLocationChange(e.target.value, dropoff)
            }}
            className="px-4 py-3 rounded-xl bg-[#090a0f] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-sm transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-normal text-zinc-400 uppercase tracking-[0.2em]">Dropoff Destination</label>
          <input
            type="text"
            placeholder="e.g., Roshan Gate..."
            value={dropoff}
            onChange={(e) => {
              setDropoff(e.target.value)
              handleLocationChange(pickup, e.target.value)
            }}
            className="px-4 py-3 rounded-xl bg-[#090a0f] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-sm transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm transition tracking-wide flex items-center justify-center gap-2 mt-2 disabled:opacity-50 shadow-lg"
        >
          {loading ? (
            'Redirecting...'
          ) : (
            <>
              <span>PAY WITH STRIPE</span>
              <span className="text-zinc-500">•</span>
              <span className="font-semibold text-emerald-600">₹{fare}</span>
            </>
          )}
        </button>

        {message && <p className="text-xs text-center mt-2 text-zinc-400 font-light">{message}</p>}
      </form>
    </div>
  )
}