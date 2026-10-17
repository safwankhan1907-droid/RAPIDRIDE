"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface LiveMapProps {
  pickup?: string;
  dropoff?: string;
}

// Haversine formula to calculate accurate road distance in km
function calculateRoadDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  // Multiply by 1.3 to account for actual road curves and turns
  const roadKm = straightKm * 1.3;
  return Math.max(roadKm, 1.2).toFixed(1);
}

// Component to handle dynamic route bounding and drawing with accurate distance
function RouteUpdater({ pickup, dropoff }: { pickup?: string; dropoff?: string }) {
  const map = useMap();
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!pickup || !dropoff) return;

    // Simulated coordinate mapping for demo locations around Chhatrapati Sambhajinagar
    const coordsMap: Record<string, [number, number]> = {
      "railway station": [19.8456, 75.3211],
      "cidco": [19.8690, 75.3512],
      "kat kat gate": [19.8876, 75.3433],
      "roshan gate": [19.8783, 75.3275],
      "kranti chowk": [19.8762, 75.3361],
    };

    const pKey = pickup.toLowerCase().trim();
    const dKey = dropoff.toLowerCase().trim();

    const startCoord: [number, number] = coordsMap[pKey] || [19.8456, 75.3211]; // Default Railway Station
    const endCoord: [number, number] = coordsMap[dKey] || [19.8690, 75.3512];   // Default CIDCO

    // Add a middle waypoint to simulate realistic road routing curves
    const midCoord: [number, number] = [
      (startCoord[0] + endCoord[0]) / 2 + 0.0025,
      (startCoord[1] + endCoord[1]) / 2 - 0.0015,
    ];

    const routePoints = [startCoord, midCoord, endCoord];

    // Draw Google Maps style highlighted road path
    const outlinePolyline = L.polyline(routePoints, {
      color: "#ffffff",
      weight: 8,
      opacity: 0.9,
    }).addTo(map);

    const mainPolyline = L.polyline(routePoints, {
      color: "#f43f5e",
      weight: 4,
      opacity: 1.0,
    }).addTo(map);

    // Fit map bounds to show both points with padding
    const group = L.featureGroup([outlinePolyline, mainPolyline]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    // Calculate accurate distance using Haversine formula
    const dist = calculateRoadDistance(startCoord[0], startCoord[1], endCoord[0], endCoord[1]);
    const estMinutes = Math.max(Math.round(Number(dist) * 3.5), 4);

    setRouteInfo({
      distance: `${dist} km`,
      duration: `${estMinutes} mins`,
    });

    return () => {
      map.removeLayer(outlinePolyline);
      map.removeLayer(mainPolyline);
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

  const customIcon = L.divIcon({
    className: "custom-map-marker",
    html: `<div style="background-color: #f43f5e; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #f43f5e;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

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
        <Marker position={center} icon={customIcon}>
          <Popup>RapidRide Central Fleet Hub</Popup>
        </Marker>
        <RouteUpdater pickup={pickup} dropoff={dropoff} />
      </MapContainer>
    </div>
  );
}
