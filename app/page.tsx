'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import BookingForm from '@/components/BookingForm'
import LiveMap from '@/components/LiveMap'
import RideHistory from '@/components/RideHistory'
import { UserButton, useUser } from '@clerk/nextjs'

function DashboardContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [rides, setRides] = useState<any[]>([])

  // Fetch rides from Supabase and map fields safely for RideHistory & Receipt
  const fetchRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rides:', error.message)
    } else {
      const formattedRides = (data || []).map((ride) => ({
        id: ride.id,
        pickup: ride.pickup || ride.pickup_location || 'Pickup Location',
        dropoff: ride.dropoff || ride.dropoff_location || 'Dropoff Location',
        fare: ride.fare || 300,
        created_at: ride.created_at,
        status: ride.status || 'COMPLETED',
        rating: ride.rating,
        review: ride.review
      }))
      setRides(formattedRides)
    }
  }

  // Handle Stripe Success Callback & Save Ride to Supabase
  useEffect(() => {
    const success = searchParams.get('success')
    const pickupVal = searchParams.get('pickup')
    const dropoffVal = searchParams.get('dropoff')
    const fareVal = searchParams.get('fare')

    if (success === 'true' && pickupVal && dropoffVal && fareVal) {
      const saveRide = async () => {
        const { error } = await supabase.from('rides').insert([
          {
            pickup: pickupVal,
            dropoff_location: dropoffVal,
            fare: parseFloat(fareVal),
            user_id: user ? user.id : 'guest_user',
            user_email: user?.primaryEmailAddress?.emailAddress || 'guest@rapidride.com',
            status: 'COMPLETED'
          }
        ])

        if (!error) {
          window.history.replaceState({}, '', '/')
          fetchRides()
        } else {
          console.warn('Primary insert failed, attempting fallback...', error.message)
          await supabase.from('rides').insert([
            {
              dropoff_location: dropoffVal,
              fare: parseFloat(fareVal),
              status: 'COMPLETED'
            }
          ])
          window.history.replaceState({}, '', '/')
          fetchRides()
        }
      }

      saveRide()
    } else {
      fetchRides()
    }
  }, [searchParams, user])

  return (
    <main className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center py-4 mb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 font-bold flex items-center justify-center text-sm shadow-md">
            R
          </div>
          <h1 className="text-xl font-light tracking-widest text-zinc-100">RAPID<span className="font-semibold text-white">RIDE</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40 font-medium">
            Stripe Live Mode Active
          </span>
          <UserButton />
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <BookingForm onRideBooked={fetchRides} />
          <RideHistory rides={rides} onRideUpdated={fetchRides} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="w-full bg-[#0f1117] p-4 rounded-2xl border border-zinc-800 shadow-xl">
            <h3 className="text-xs font-normal text-zinc-400 uppercase tracking-[0.2em] mb-3">Live Fleet Radar</h3>
            <LiveMap />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090a0f] text-zinc-400 flex items-center justify-center text-sm">Loading RapidRide...</div>}>
      <DashboardContent />
    </Suspense>
  )
}