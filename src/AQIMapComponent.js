// src/AQIMapComponent.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- COMPONENT TO HANDLE CLICKS ---
function LocationMarker({ onLocationSelect }) {
    const [position, setPosition] = useState(null);
    const map = useMap();

    // Listen for map clicks
    useMapEvents({
        click(e) {
            setPosition(e.latlng); // Move marker locally
            map.flyTo(e.latlng, map.getZoom()); // Smooth animate to spot
            onLocationSelect(e.latlng.lat, e.latlng.lng); // Tell Parent (Dashboard) to fetch data
        },
    });

    // If no position clicked yet, show nothing (or default)
    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

// --- HELPER TO SET INITIAL VIEW ---
function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 10);
    }, [lat, lng, map]);
    return null;
}

const AQIMapComponent = ({ onLocationSelect }) => {
    // Default Start: IIT Patna
    const startPos = [25.5358, 84.8512];

    return (
        <div style={{ height: "100%", width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
            <MapContainer
                center={startPos}
                zoom={10}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                {/* Clean White Map */}
                <TileLayer
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* AQI Overlay */}
                <TileLayer
                    attribution='WAQI'
                    url="https://tiles.aqicn.org/tiles/use-aqi/{z}/{x}/{y}.png?token=demo"
                />

                {/* Handles Clicks & Marker Movement */}
                <LocationMarker onLocationSelect={onLocationSelect} />

                {/* Default Marker for start position */}
                <Marker position={startPos}><Popup>IIT Patna (Start)</Popup></Marker>
            </MapContainer>
        </div>
    );
};

export default AQIMapComponent;