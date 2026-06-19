import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Correction des icônes Leaflet cassées sous Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIcon,
    shadowUrl:     markerShadow,
});

const FRANCE_CENTER = [46.603354, 1.888334];

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom ?? 13, { animate: true });
        }
    }, [center, zoom, map]);
    return null;
}

export default function LeafletMap({ associations = [], events = [], center = null, selectedId = null }) {
    return (
        <MapContainer
            center={FRANCE_CENTER}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
            />

            {center && <MapController center={center} zoom={13} />}

            {associations.map(a => (
                <Marker key={`assoc-${a.id}`} position={[a.lat, a.lng]}>
                    <Popup>
                        <strong>{a.name}</strong>
                        <br />
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{a.city}</span>
                        <br />
                        <Link to={`/associations/${a.id}`} style={{ fontSize: "0.85rem", color: "#2563eb" }}>
                            Voir la page
                        </Link>
                    </Popup>
                </Marker>
            ))}

            {events.map(e => (
                <Marker key={`event-${e.id}`} position={[e.lat, e.lng]}>
                    <Popup>
                        <strong>{e.name}</strong>
                        {e.startDate && (
                            <>
                                <br />
                                <span style={{ fontSize: "0.8rem" }}>
                                    {new Date(e.startDate).toLocaleDateString("fr-FR")}
                                </span>
                            </>
                        )}
                        <br />
                        <Link to={`/evenements/${e.id}`} style={{ fontSize: "0.85rem", color: "#2563eb" }}>
                            Voir l&apos;événement
                        </Link>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
