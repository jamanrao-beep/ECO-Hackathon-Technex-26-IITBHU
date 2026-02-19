// src/UrbanHeatDistribution.js
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const DynamicHeatZones = () => {
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
                const anomaly = Math.abs(Math.sin(seed) * 12);

                let type = "Urban Concrete Core";
                if (anomaly > 9) type = "Hyperscale AI Data Center";
                else if (anomaly > 6) type = "Industrial Server Farm";
                else if (anomaly < 3) type = "Vegetative Cooling Zone";

                let waterUsage = 0;
                if (type === "Hyperscale AI Data Center") waterUsage = (anomaly * 0.8).toFixed(1);
                else if (type === "Industrial Server Farm") waterUsage = (anomaly * 0.4).toFixed(1);

                generated.push({
                    id: `${lat.toFixed(3)}-${lng.toFixed(3)}`,
                    pos: [lat + jitterLat, lng + jitterLng],
                    anomaly: anomaly,
                    type: type,
                    waterUsage: waterUsage
                });
            }
        }
        return generated;
    }, [bounds]);

    return (
        <>
            {zones.map(zone => {
                let displayColor = '#2ecc71';
                if (zone.anomaly > 3) displayColor = '#f39c12';
                if (zone.anomaly > 6) displayColor = '#e74c3c';
                if (zone.anomaly > 9) displayColor = '#8e44ad';

                return (
                    <CircleMarker
                        key={zone.id} center={zone.pos} radius={zone.anomaly > 9 ? 45 : 30}
                        pathOptions={{ color: displayColor, fillColor: displayColor, fillOpacity: 0.35, weight: 0 }}
                    >
                        <Tooltip sticky>
                            <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                                <strong>{zone.type}</strong><br />
                                <span style={{ color: displayColor, fontWeight: 'bold' }}>
                                    Thermal Anomaly: +{zone.anomaly.toFixed(1)}°C
                                </span>
                                {zone.waterUsage > 0 && (
                                    <>
                                        <br />
                                        <span style={{ color: '#00d2ff', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                            💧 Est. Cooling Water: {zone.waterUsage}M Liters/Day
                                        </span>
                                    </>
                                )}
                            </div>
                        </Tooltip>
                    </CircleMarker>
                );
            })}
        </>
    );
};

// NEW: Accept userPos as a prop
const UrbanHeatDistribution = ({ userPos }) => {
    // Default to user's position if available, else fallback
    const center = userPos || [25.5941, 85.1376];

    return (
        <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <DynamicHeatZones />

            {/* NEW: Render the User's Location Pin */}
            {userPos && (
                <Marker position={userPos}>
                    <Popup><strong>You are here</strong><br />Live Location</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default UrbanHeatDistribution;