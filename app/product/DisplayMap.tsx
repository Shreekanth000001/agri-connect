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

// Helper function to safely parse messy coordinates
function parseCoordinates(locString: string | null | undefined): [number, number] | null {
  if (!locString) return null;
  
  // Replace commas with spaces, split by any amount of whitespace, and convert to numbers
  const parsed = locString.replace(/,/g, ' ').split(/\s+/).map(Number);
  
  // Ensure both numbers are valid before returning
  if (!isNaN(parsed[0]) && !isNaN(parsed[1])) {
    return [parsed[0], parsed[1]];
  }
  return null;
}

export default function DisplayMap({ farmerLoc, buyerLoc }: { farmerLoc: string, buyerLoc?: string | null }) {
  
  // 1. Safely parse the Farmer's location
  let fCoords = parseCoordinates(farmerLoc);
  
  // Fallback to Bengaluru if the farmer's coordinates are completely broken
  if (!fCoords) {
    console.warn("Invalid farmer coordinates found. Defaulting to Bengaluru.");
    fCoords = [12.9716, 77.5946]; 
  }

  // 2. Safely parse the Buyer's location
  const bCoords = parseCoordinates(buyerLoc);

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

        {/* If the buyer is logged in and has valid coordinates, show their pin and a connecting line */}
        {bCoords && (
          <>
            <Marker position={bCoords} icon={customIcon}>
               <Popup>Your Location</Popup>
            </Marker>
            <Polyline positions={[fCoords, bCoords]} color="#009C25" dashArray="5, 10" />
          </>
        )}
      </MapContainer>
    </div>
  );
}