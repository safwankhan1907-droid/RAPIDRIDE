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

    const fetchCoordinatesAndRoute = async () => {
      try {
        // Helper function to get coordinates for any location name using Nominatim API dynamically
        const getCoords = async (loc: string) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc + ", Chhatrapati Sambhajinagar")}`
          );
          const data = await res.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lon), parseFloat(data[0].lat)] as [number, number];
          }
          // Fallback coordinates (Kranti Chowk) if location is not found
          return [75.3361, 19.8762] as [number, number];
        };

        const startCoord = await getCoords(pickup);
        const endCoord = await getCoords(dropoff);

        // Fetch real road route from OSRM using dynamic coordinates
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?overview=full&geometries=geojson`
        );
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
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
        console.error("Geocoding or Routing error:", err);
      }
    };

    fetchCoordinatesAndRoute();

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
