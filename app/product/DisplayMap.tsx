// components/DisplayMap.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function DisplayMap({ farmerLoc, buyerLoc }: { farmerLoc: string, buyerLoc?: string | null }) {
  // Parse the "lat lng" strings back into arrays of numbers
  const fCoords = farmerLoc.split(' ').map(Number) as [number, number];
  const bCoords = buyerLoc ? (buyerLoc.split(' ').map(Number) as [number, number]) : null;

  return (
    <div className="h-[300px] w-full rounded-md overflow-hidden border border-gray-300 z-0 relative">
      <MapContainer 
        center={fCoords} 
        zoom={bCoords ? 6 : 10} // Zoom out a bit if we need to show two pins
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* The Farmer's Pin */}
        <Marker position={fCoords} icon={customIcon}>
          <Popup>Farm Location</Popup>
        </Marker>

        {/* If the buyer is logged in, show their pin and a connecting line */}
        {bCoords && (
          <>
            <Marker position={bCoords} icon={customIcon}>
               <Popup>Your Location</Popup>
            </Marker>
            <Polyline positions={[fCoords, bCoords]} color="blue" dashArray="5, 10" />
          </>
        )}
      </MapContainer>
    </div>
  );
}