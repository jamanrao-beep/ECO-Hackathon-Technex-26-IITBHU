// src/AQIPredictiveMap.js
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const DynamicZones = ({ hourOffset }) => {
    const [bounds, setBounds] = useState(null);
    const map = useMapEvents({
        moveend: () => setBounds(map.getBounds()),
        zoomend: () => setBounds(map.getBounds()),
    });

    useEffect(() => { setBounds(map.getBounds()); }, [map]);

    const zones = useMemo(() => {
        if (!bounds) return [];
        const generated = [];
        const latStep = (bounds.getNorth() - bounds.getSouth()) / 8;
        const lngStep = (bounds.getEast() - bounds.getWest()) / 8;

        for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += latStep) {
            for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += lngStep) {
                const seed = lat * lng * 10000;
                const jitterLat = Math.sin(seed) * latStep * 0.6;
                const jitterLng = Math.cos(seed) * lngStep * 0.6;
                const pseudoRandomAQI = Math.abs(Math.sin(seed) * 200) + 20;

                generated.push({
                    id: `${lat.toFixed(3)}-${lng.toFixed(3)}`,
                    pos: [lat + jitterLat, lng + jitterLng],
                    baseAQI: Math.round(pseudoRandomAQI)
                });
            }
        }
        return generated;
    }, [bounds]);

    return (
        <>
            {zones.map(zone => {
                const dynamicAQI = Math.round(zone.baseAQI + (hourOffset * 2.5));
                const displayColor = dynamicAQI > 150 ? '#e74c3c' : (dynamicAQI > 80 ? '#f1c40f' : '#2ecc71');

                return (
                    <CircleMarker
                        key={zone.id} center={zone.pos} radius={25}
                        pathOptions={{ color: displayColor, fillColor: displayColor, fillOpacity: 0.25, weight: 0 }}
                    >
                        <Tooltip sticky>
                            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                <strong>Scanned Sector</strong><br />
                                <span style={{ color: displayColor, fontWeight: 'bold' }}>Predicted AQI: {dynamicAQI}</span><br />
                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(+{hourOffset}h Forecast)</span>
                            </div>
                        </Tooltip>
                    </CircleMarker>
                );
            })}
        </>
    );
};

const AQIPredictiveMap = ({ hourOffset, userPos }) => {
    // Default to user's position if available, else IIT Patna
    const center = userPos || [25.5358, 84.8512];

    return (
        <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <DynamicZones hourOffset={hourOffset} />

            {/* NEW: Display the user's live location with a map pin */}
            {userPos && (
                <Marker position={userPos}>
                    <Popup><strong>You are here</strong><br />Live Location</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default AQIPredictiveMap;