'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically load React-Leaflet components with SSR disabled to completely prevent DOM reuse errors
const MapWithNoSSR = dynamic(
  async () => {
    const L = await import('leaflet')
    const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })

    return function MapComponent() {
      return (
        <MapContainer
          center={[19.8762, 75.3433]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[19.8762, 75.3433]} icon={defaultIcon}>
            <Popup>RapidRide Cab Available Here</Popup>
          </Marker>
        </MapContainer>
      )
    }
  },
  { ssr: false }
)

export default function LiveMap() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[300px] bg-[#090a0f] rounded-xl flex items-center justify-center text-zinc-500 text-xs">
        Loading Map...
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-zinc-800/80 relative z-0">
      <MapWithNoSSR />
    </div>
  )
}