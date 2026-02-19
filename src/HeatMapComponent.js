// src/HeatMapComponent.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ onLocationSelect }) {
    const [position, setPosition] = useState(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return position === null ? null : <Marker position={position}><Popup>Selected Heat Zone</Popup></Marker>;
}

const HeatMapComponent = ({ onLocationSelect }) => {
    return (
        <div style={{ height: "100%", width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
            <MapContainer center={[25.5358, 84.8512]} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                {/* White/Grey Light Map */}
                <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <LocationMarker onLocationSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
};
export default HeatMapComponent;