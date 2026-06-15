"use client";

import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Report = {
  id: string;
  animal_type: string;
  animal_condition: string;
  priority: string;
  status: string;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
};

function getMarkerColor(priority: string) {
  if (priority === "red") return "#ef4444";
  if (priority === "yellow") return "#f59e0b";
  if (priority === "green") return "#10b981";

  return "#6b7280";
}

function createMarkerIcon(priority: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: ${getMarkerColor(priority)};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function ReportsMapClient({ reports }: { reports: Report[] }) {
  const reportsWithCoords = reports.filter(
    (report) => report.location_lat !== null && report.location_lng !== null
  );

  const Map = MapContainer as any;
  const Tiles = TileLayer as any;
  const MapMarker = Marker as any;

  return (
    <Map
      center={[44.095, 39.073]}
      zoom={11}
      className="h-[75vh] w-full rounded-3xl"
    >
      <Tiles
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reportsWithCoords.map((report) => (
        <MapMarker
          key={report.id}
          position={[report.location_lat!, report.location_lng!]}
          icon={createMarkerIcon(report.priority)}
        >
          <Popup>
            <div className="space-y-2">
              <div className="font-semibold">
                {report.animal_type} · {report.animal_condition}
              </div>

              <div>{report.location_address || "Без адреса"}</div>

              <Link
                href={`/admin/reports/${report.id}`}
                className="font-semibold text-emerald-700"
              >
                Открыть заявку
              </Link>
            </div>
          </Popup>
        </MapMarker>
      ))}
    </Map>
  );
}