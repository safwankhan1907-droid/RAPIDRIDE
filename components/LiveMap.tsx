"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon issue in Next.js
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveMapProps {
  pickup?: string;
  dropoff?: string;
}

// Component to handle dynamic route bounding and drawing
function RouteUpdater({ pickup, dropoff }: { pickup: string; dropoff: string }) {
  const map = useMap();
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!pickup || !dropoff) return;

    // Simulated coordinate mapping for demo locations around Chhatrapati Sambhajinagar
    // In production, this can use Nominatim Geocoding API
    const coordsMap: Record<string, [number, number]> = {
      "kat kat gate": [19.8876, 75.3433],
      "roshan gate": [19.8783, 75.3275],
      "cidco": [19.8690, 75.3512],
      "station road": [19.8456, 75.3211],
      "kranti chowk": [19.8762, 75.3361],
    };

    const pKey = pickup.toLowerCase().trim();
    const dKey = dropoff.toLowerCase().trim();

    const startCoord: [number, number] = coordsMap[pKey] || [19.8762, 75.3361]; // Default Kranti Chowk
    const endCoord: [number, number] = coordsMap[dKey] || [19.8876, 75.3433];   // Default Kat Kat Gate

    // Draw a polyline between pickup and dropoff
    const polyline = L.polyline([startCoord, endCoord], {
      color: "#f43f5e", // Rose-500 matching theme
      weight: 5,
      opacity: 0.8,
      dashArray: "10, 10",
    }).addTo(map);

    // Fit map bounds to show both points
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Calculate mock distance & duration based on coordinate delta
    const distanceKm = (
      Math.abs(startCoord[0] - endCoord[0]) * 111 +
      Math.abs(startCoord[1] - endCoord[1]) * 111
    ).toFixed(1);
    const estMinutes = Math.max(Math.round(Number(distanceKm) * 3), 5);

    setRouteInfo({
      distance: `${Math.max(Number(distanceKm), 2.5)} km`,
      duration: `${estMinutes} mins`,
    });

    return () => {
      map.removeLayer(polyline);
    };
  }, [pickup, dropoff, map]);

  return (
    <>
      {routeInfo && (
        <div className="absolute bottom-4 left-4 z-[999] bg-[#0e0a17]/90 border border-rose-500/50 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center space-x-3">
          <span className="text-lg">🚗</span>
          <div>
            <p className="text-[10px] font-mono text-rose-300 uppercase tracking-widest font-bold">
              Route Estimate
            </p>
            <p className="text-xs font-mono text-purple-100">
              {routeInfo.distance} • ~{routeInfo.duration} arrival
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function LiveMap({ pickup, dropoff }: LiveMapProps) {
  const center: [number, number] = [19.8762, 75.3361]; // Chhatrapati Sambhajinagar center

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", background: "#06040c" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>RapidRide Central Fleet Hub</Popup>
        </Marker>
        <RouteUpdater pickup={pickup} dropoff={dropoff} />
      </MapContainer>
    </div>
  );
}
