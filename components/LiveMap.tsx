"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface LiveMapProps {
  pickup?: string;
  dropoff?: string;
}

function RouteUpdater({ pickup, dropoff }: { pickup?: string; dropoff?: string }) {
  const map = useMap();
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!pickup || !dropoff) return;

    let outlinePolyline: L.Polyline | null = null;
    let mainPolyline: L.Polyline | null = null;

    // Comprehensive coordinate dictionary for Chhatrapati Sambhajinagar (Lng, Lat format for OSRM)
    const locationsMap: Record<string, [number, number]> = {
      "railway station": [75.3211, 19.8456],
      "cidco": [75.3512, 19.8690],
      "kat kat gate": [75.3433, 19.8876],
      "roshan gate": [75.3275, 19.8783],
      "kranti chowk": [75.3361, 19.8762],
      "harsul": [75.3620, 19.9100],
      "prozone mall": [75.3580, 19.8750],
      "bus stand": [75.3310, 19.8710],
      "jaisinghpura": [75.3150, 19.8900],
      "osmanpura": [75.3290, 19.8680],
      "shahgunj": [75.3230, 19.8810],
      "aurangpura": [75.3280, 19.8850],
      "nirala bazar": [75.3330, 19.8790],
      "padegaon": [75.3050, 19.9200],
    };

    const pKey = pickup.toLowerCase().trim();
    const dKey = dropoff.toLowerCase().trim();

    // Smart fallback if location name is slightly different
    const getCoords = (name: string): [number, number] => {
      if (locationsMap[name]) return locationsMap[name];
      // Search partial match
      for (const key of Object.keys(locationsMap)) {
        if (name.includes(key) || key.includes(name)) {
          return locationsMap[key];
        }
      }
      // Default center (Kranti Chowk)
      return [75.3361, 19.8762];
    };

    const startCoord = getCoords(pKey);
    const endCoord = getCoords(dKey);

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const latLngPoints: [number, number][] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          outlinePolyline = L.polyline(latLngPoints, {
            color: "#ffffff",
            weight: 9,
            opacity: 0.9,
          }).addTo(map);

          mainPolyline = L.polyline(latLngPoints, {
            color: "#f43f5e",
            weight: 5,
            opacity: 1.0,
          }).addTo(map);

          const group = L.featureGroup([outlinePolyline, mainPolyline]);
          map.fitBounds(group.getBounds(), { padding: [50, 50] });

          const distKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.max(Math.round(route.duration / 60), 3);

          setRouteInfo({
            distance: `${distKm} km`,
            duration: `~${durationMin} mins`,
          });
        }
      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    fetchRoute();

    return () => {
      if (outlinePolyline) map.removeLayer(outlinePolyline);
      if (mainPolyline) map.removeLayer(mainPolyline);
    };
  }, [pickup, dropoff, map]);

  return (
    <>
      {routeInfo && (
        <div className="absolute bottom-4 left-4 z-[999] bg-[#0e0a17]/90 border border-rose-500/50 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center space-x-3">
          <span className="text-lg">🗺️</span>
          <div>
            <p className="text-[10px] font-mono text-rose-300 uppercase tracking-widest font-bold">
              Google-Style Road Route
            </p>
            <p className="text-xs font-mono text-purple-100">
              {routeInfo.distance} • {routeInfo.duration} arrival
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function LiveMap({ pickup, dropoff }: LiveMapProps) {
  const center: [number, number] = [19.8762, 75.3361];

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
