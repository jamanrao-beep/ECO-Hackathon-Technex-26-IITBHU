// src/AQIRoutingMap.js
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function RoutingBounds({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coords, map]);
    return null;
}

const AQIRoutingMap = ({ routeData }) => {
    return (
        <MapContainer center={[25.5941, 85.1376]} zoom={6} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {routeData && (
                <>
                    <Marker position={routeData.start}><Popup>Start Location</Popup></Marker>
                    <Marker position={routeData.end}><Popup>Destination</Popup></Marker>

                    {/* Draws the actual driving roads using the OSRM path */}
                    <Polyline positions={routeData.path} pathOptions={{ color: '#00d2ff', weight: 5, dashArray: '10, 15' }}>
                        <Popup>AI Optimized Clean Route</Popup>
                    </Polyline>
                    <RoutingBounds coords={routeData.path} />
                </>
            )}
        </MapContainer>
    );
};

export default AQIRoutingMap;