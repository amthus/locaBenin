import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "@/data/properties";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const propertyCoords: Record<string, [number, number]> = {
  "Akpakpa": [6.3654, 2.4183],
  "Ganhi": [6.3670, 2.4290],
  "Zogbadjè": [6.4448, 2.3470],
  "Haie Vive": [6.3598, 2.4098],
  "Fidjrossè": [6.3480, 2.3720],
  "Godomey": [6.3970, 2.3450],
};

interface MapViewProps {
  properties: Property[];
  onSelectProperty?: (id: string) => void;
}

const MapView = ({ properties, onSelectProperty }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([6.3703, 2.3912], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    properties.forEach((p) => {
      const coords = propertyCoords[p.quartier];
      if (!coords) return;

      const jitter: [number, number] = [
        coords[0] + (Math.random() - 0.5) * 0.005,
        coords[1] + (Math.random() - 0.5) * 0.005,
      ];

      const priceFormatted = new Intl.NumberFormat("fr-BJ").format(p.price);
      
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: hsl(152, 45%, 38%); color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">${priceFormatted} F</div>`,
        iconSize: [0, 0],
        iconAnchor: [40, 20],
      });

      const marker = L.marker(jitter, { icon }).addTo(map);
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <img src="${p.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
          <strong style="font-size: 13px;">${p.title}</strong>
          <p style="font-size: 11px; color: #666; margin: 4px 0;">${p.quartier}, ${p.location}</p>
          <p style="font-size: 14px; font-weight: 700; color: hsl(152, 45%, 38%);">${priceFormatted} FCFA/mois</p>
          ${p.verified ? '<span style="background: hsl(152, 45%, 38%); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px;">✓ Vérifié</span>' : ''}
        </div>
      `);

      marker.on("click", () => onSelectProperty?.(p.id));
    });
  }, [properties, onSelectProperty]);

  return <div ref={mapRef} className="w-full h-full min-h-[500px] rounded-lg" />;
};

export default MapView;
