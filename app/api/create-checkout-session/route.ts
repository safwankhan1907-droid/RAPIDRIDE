import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

export async function POST(req: Request) {
  try {
    // 1. Verify user authentication on the server
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Please login to book a ride' }, { status: 401 })
    }

    const { pickup, dropoff, fare } = await req.json()

    // 2. Validate input parameters securely
    if (!pickup || !dropoff || typeof fare !== 'number' || fare <= 0) {
      return NextResponse.json({ error: 'Invalid ride details or fare' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `RapidRide: ${pickup} to ${dropoff}`,
            },
            unit_amount: Math.round(fare * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/?success=true&pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}&fare=${fare}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe Security Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}