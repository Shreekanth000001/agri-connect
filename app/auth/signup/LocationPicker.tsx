"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// This component handles BOTH clicking the map AND the auto-locate feature
function LocationMarker({ position, setPosition }: { position: any, setPosition: any }) {
  // useMapEvents gives us the map instance so we can move the camera programmatically
  const map = useMapEvents({
    click(e) {
      // Move the pin whenever the user clicks
      setPosition(e.latlng);
    },
  });

  // Run this once when the map first loads
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const { latitude, longitude } = geoPosition.coords;
          const userLocation = L.latLng(latitude, longitude);

          // 1. Fly the map camera to the user's rough location (Zoom level 14 is a good city/neighborhood view)
          map.flyTo(userLocation, 14, {
            animate: true,
            duration: 1.5 // Adds a nice smooth panning animation
          });

          // 2. Drop the initial pin at their rough location so they have a starting point
          setPosition(userLocation);
        },
        (error) => {
          // If they deny location permissions or are on a weird network, 
          // this fails silently and just leaves the map centered on the default view.
          console.log("Geolocation error or denied:", error.message);
        }
      );
    }
  }, [map, setPosition]);

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function LocationPicker({ onLocationSelect }: { onLocationSelect: (loc: string) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (position) {
      const formattedLoc = `${position.lat} ${position.lng}`;
      onLocationSelect(formattedLoc);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-300 z-0 relative">
      <MapContainer 
        center={[20.5937, 78.9629]} // Default fallback (e.g., India)
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}