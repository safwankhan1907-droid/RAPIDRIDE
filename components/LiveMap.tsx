"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface LiveMapProps {
  pickup?: string;
  dropoff?: string;
}

// Component to handle dynamic route bounding and drawing with Google Maps style highlight
function RouteUpdater({ pickup, dropoff }: { pickup?: string; dropoff?: string }) {
  const map = useMap();
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!pickup || !dropoff) return;

    // Simulated coordinate mapping for demo locations around Chhatrapati Sambhajinagar
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

    // Draw Google Maps style double-stroke highlighted polyline
    const outlinePolyline = L.polyline([startCoord, endCoord], {
      color: "#ffffff", // White outline for highlight
      weight: 9,
