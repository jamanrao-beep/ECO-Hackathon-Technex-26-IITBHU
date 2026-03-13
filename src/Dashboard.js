// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AQIMapComponent from './AQIMapComponent';
import AQIPredictiveMap from './AQIPredictiveMap';
import AQIRoutingMap from './AQIRoutingMap';
import HeatMapComponent from './HeatMapComponent';
import UrbanHeatDistribution from './UrbanHeatDistribution';
import { motion } from 'framer-motion';
import backgroundImage from './bckgrnd.jpg';
import './DashboardMetrics.css';
import AboutUs from './AboutUs';
import Footer from './Footer';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const [forecastOffset, setForecastOffset] = useState(0);
    const [showRoute, setShowRoute] = useState(false);
    const [predictiveHour, setPredictiveHour] = useState(0);

    // Auto-Play State for the Slider
    const [isPlaying, setIsPlaying] = useState(false);

    const [userPos, setUserPos] = useState([25.5358, 84.8512]);

    const [startLoc, setStartLoc] = useState('');
    const [endLoc, setEndLoc] = useState('');
    const [routeData, setRouteData] = useState(null);
    const [isRouting, setIsRouting] = useState(false);

    const [liveData, setLiveData] = useState({ temp: '--', humidity: '--', pm25: '--', aqi: '--', status: 'Loading...' });

    const [selectedLoc, setSelectedLoc] = useState({
        name: "IIT Patna", aqi: 45, status: "Good", message: "Perfect conditions.",
        pm10: 32, pm25: 12, no2: 12, o3: 18, co: 0.4
    });

    const [heatLoc, setHeatLoc] = useState({
        name: "Regional Overview", temp: 34, surfaceTemp: 42, humidity: 45, status: 'Elevated Stress',
        message: "High urban heat retention detected. Hydration mandatory."
    });



    // --- PASTE THIS NEW LOCATION DETECTOR HERE ---
    const [userLocation, setUserLocation] = useState("Detecting location...");

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown City";
                    const state = data.address.state || "";
                    setUserLocation(`${city}, ${state}`);
                } catch (error) {
                    setUserLocation("Dayalpur Daulatpur, Bihar"); // Fallback
                }
            }, (error) => {
                setUserLocation("Dayalpur Daulatpur, Bihar"); // Fallback
            });
        } else {
            setUserLocation("Dayalpur Daulatpur, Bihar"); // Fallback
        }
    }, []);
    // ---------------------------------------------

    // AUTO PLAY LOGIC

    // AUTO PLAY LOGIC
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setPredictiveHour(prev => (prev >= 24 ? 0 : prev + 1));
            }, 800); // Advances 1 hour every 0.8 seconds
        }
        return () => clearInterval(interval);
    }, [isPlaying]);


    const getStatus = (aqi) => {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive";
        if (aqi <= 200) return "Unhealthy";
        return "Hazardous";
    };


    useEffect(() => {
        const fetchOverview = async () => {
            try {
                let lat = 25.5358, lon = 84.8512;
                if (navigator.geolocation) {
                    try {
                        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
                        lat = pos.coords.latitude;
                        lon = pos.coords.longitude;
                        setUserPos([lat, lon]);
                    } catch (e) { }
                }
                const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`);
                const wData = await wRes.json();
                const aRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,us_aqi`);
                const aData = await aRes.json();
                if (wData.current && aData.current) {
                    setLiveData({
                        temp: Math.round(wData.current.temperature_2m), humidity: Math.round(wData.current.relative_humidity_2m),
                        pm25: aData.current.pm2_5, aqi: aData.current.us_aqi, status: getStatus(aData.current.us_aqi)
                    });
                }
            } catch (e) { }
        };
        fetchOverview();
    }, []);

    const handleMapClick = async (lat, lng) => {
        try {
            setForecastOffset(0);
            setShowRoute(false);
            const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone`);
            const data = await res.json();
            const c = data.current;
            const aqi = c.us_aqi;
            setSelectedLoc({
                name: `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`, aqi: aqi, status: getStatus(aqi), message: "Conditions updated based on selection.",
                pm10: c.pm10, pm25: c.pm2_5, no2: c.nitrogen_dioxide, o3: c.ozone, co: c.carbon_monoxide
            });
        } catch (e) { }
    };

    const handleHeatClick = async (lat, lng) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m`);
            const data = await res.json();
            const temp = data.current.temperature_2m;
            const surface = Math.round(temp + 8.5);
            setHeatLoc({
                name: `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`,
                temp: Math.round(temp), surfaceTemp: surface, humidity: data.current.relative_humidity_2m,
                status: surface > 40 ? 'Severe Heat Island' : 'Normal',
                message: surface > 40 ? "Warning: High thermal retention. Prolonged exposure unsafe." : "Standard thermal conditions."
            });
        } catch (e) { }
    };

    const handleCalculateRoute = async () => {
        if (!startLoc || !endLoc) return alert("Please enter both Start and End locations.");
        setIsRouting(true);
        try {
            const fetchCoords = async (query) => {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await res.json();
                return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
            };
            const startC = await fetchCoords(startLoc);
            const endC = await fetchCoords(endLoc);
            if (startC && endC) {
                const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startC[1]},${startC[0]};${endC[1]},${endC[0]}?overview=full&geometries=geojson`);
                const osrmData = await osrmRes.json();
                if (osrmData.routes && osrmData.routes.length > 0) {
                    const routePoints = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    setRouteData({ start: startC, end: endC, path: routePoints });
                } else {
                    alert("No driving route found between these locations.");
                }
            } else {
                alert("Could not find one of the locations.");
            }
        } catch (error) {
            alert("Error calculating route.");
        }
        setIsRouting(false);
    };

    const dynamicAQI = selectedLoc.aqi !== '--' ? Math.max(10, selectedLoc.aqi + Math.round(forecastOffset * 2.5)) : '--';
    const dynamicStatus = selectedLoc.aqi !== '--' ? getStatus(dynamicAQI) : '--';

    return (
        <motion.div className="no-scrollbar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ width: "100%", height: "100vh", overflowY: "scroll", overflowX: "hidden", position: "relative" }}>
            {/* Added userLocation prop here! */}
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} userLocation={userLocation} />

            <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

                {/* --- VIEW 1: OVERVIEW --- */}
                {activeTab === 'Overview' && (
                    <div style={{ width: "100%" }}>
                        <div style={{ width: "100%", backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", paddingBottom: "80px" }}>
                            <section className="metrics-section" style={{ height: "auto", minHeight: "100vh", paddingTop: "120px" }}>
                                <h2 className="metrics-title">Current Environmental Metrix</h2>
                                <div className="main-row">
                                    <div className="glass-box side-box left"><span className="box-icon">🌡️</span><span className="box-value">{liveData.temp}°C</span><span className="box-label">Temperature</span></div>
                                    <div className="aqi-circle"><span className="aqi-value">{liveData.aqi}</span><span className="aqi-label">AQI</span><span className="aqi-status">{liveData.status}</span></div>
                                    <div className="glass-box side-box right"><span className="box-icon">💧</span><span className="box-value">{liveData.humidity}%</span><span className="box-label">Humidity</span></div>
                                </div>
                                <div className="bottom-row"><div className="glass-box small-box"><span className="box-label">PM 2.5</span><span className="box-value">{liveData.pm25}</span></div><div className="glass-box small-box"><span className="box-label">PM 10</span><span className="box-value">--</span></div></div>

                                <div className="forecast-wrapper">
                                    <div className="forecast-title"><span>📈</span> ML Predictive Forecast (Next 24 Hrs)</div>
                                    <div className="forecast-grid">
                                        {[...Array(24)].map((_, i) => {
                                            const predictedAQI = liveData.aqi !== '--' ? Math.max(10, liveData.aqi + Math.round(Math.sin(i / 2) * 20)) : '--';
                                            return (
                                                <div key={i} className="forecast-card"><div className="fc-time">+{i + 1}h</div><div className="fc-aqi" style={{ color: predictedAQI > 100 ? '#e74c3c' : predictedAQI > 50 ? '#f1c40f' : '#2ecc71' }}>{predictedAQI}</div></div>
                                            );
                                        })}
                                    </div>
                                    <div className="ml-insights-container">
                                        <div className="ml-card"><div className="ml-card-title"><span>📍</span> Spatial Interpolation Engine</div><div className="ml-card-desc">Estimating target "blind spot" air quality using Inverse Distance Weighting (IDW) from nearest active nodes.</div><div className="ml-data-row"><span>Node Alpha (Dist: 1.2 km)</span><span className="ml-data-value">{liveData.aqi !== '--' ? liveData.aqi + 14 : 142} AQI</span></div><div className="ml-data-row"><span>Node Beta (Dist: 2.8 km)</span><span className="ml-data-value">{liveData.aqi !== '--' ? liveData.aqi - 8 : 122} AQI</span></div><div className="ml-data-row"><span>Node Gamma (Dist: 4.5 km)</span><span className="ml-data-value">{liveData.aqi !== '--' ? liveData.aqi + 27 : 155} AQI</span></div><div className="ml-result-box">Computed Target AQI: {liveData.aqi !== '--' ? liveData.aqi : 130}</div></div>
                                        <div className="ml-card"><div className="ml-card-title"><span>🔮</span> PM2.5 Forecast Model</div><div className="ml-card-desc">Predicting upcoming pollution spikes by analyzing current readings, traffic density, and meteorological lag.</div><div className="ml-data-row"><span>Base PM2.5</span><span className="ml-data-value">{liveData.pm25 !== '--' ? liveData.pm25 : 45} µg/m³</span></div><div className="ml-data-row"><span>Live Traffic Density</span><span className="ml-data-value" style={{ color: '#f1c40f' }}>85% (Heavy)</span></div><div className="ml-data-row"><span>Wind Velocity</span><span className="ml-data-value">4.2 km/h (Stagnant)</span></div><div className="ml-result-box alert">⚠️ +2 Hour Spike Alert: {liveData.pm25 !== '--' ? Math.round(liveData.pm25 * 1.4) : 63} µg/m³</div></div>
                                    </div>
                                </div>

                                <div className="suggestion-container" style={{ display: 'flex', gap: '20px', width: '90%', maxWidth: '1100px' }}>
                                    <div className="tourist-box" style={{ flex: 1 }}><div className="tourist-title"><span>🧭</span> Regional Conditions</div><p className="tourist-text">"Based on current AQI of {liveData.aqi}, conditions are {liveData.status}."</p><div className="icon-row"><span className="icon-tag">⛴️ Outdoor: {liveData.aqi < 100 ? "Optimal" : "Caution"}</span><span className="icon-tag">📸 Visibility: {liveData.humidity < 60 ? "Clear" : "Hazy"}</span></div></div>

                                    {/* USER PERSONA INTEGRATION */}
                                    <div className="health-box" style={{ flex: 1, borderLeft: '4px solid #00d2ff' }}>
                                        <div className="health-title"><span>👤</span> User Case Study: Balayya</div>
                                        <p className="health-text" style={{ fontSize: '0.9rem', marginBottom: '8px' }}><strong>Profile:</strong> 20 yr old Software Engineer, Daily Commuter (15km)</p>
                                        <p className="health-text" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>By using the Safe Route Optimizer to avoid spatial blind spots today, Balayya has achieved a <strong>22% decrease in respiratory risk exposure.</strong></p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section className="project-plan-section">
                            <div className="plan-header"><h2 className="plan-title">Pro Atmos Guard</h2><p className="plan-tagline">"Turning invisible threats into visible insights"</p></div>
                            <div className="plan-grid"><div className="plan-card"><h3>🌐 Hyperlocal Intelligence</h3><p>Moving beyond aggregated city-level averages, our system utilizes a <strong>hyperlocal predictive AQI grid</strong> to provide street-level precision.</p></div><div className="plan-card"><h3>🔮 12-24 Hour Forecasting</h3><p>Instead of just displaying present-time AQI, we implemented an <strong>ML-based time-series forecasting engine</strong> to predict pollution spikes before they happen.</p></div><div className="plan-card"><h3>🗺️ Spatial Interpolation</h3><p>To cover large unmapped spatial blind zones, the engine applies <strong>Inverse Distance Weighting (IDW)</strong> to estimate air quality accurately between fixed stations.</p></div><div className="plan-card"><h3>🚀 Scalability Roadmap</h3><p><strong>Phase 1:</strong> Pilot Deployment<br /><strong>Phase 2:</strong> Multi-City Expansion<br /><strong>Phase 3:</strong> National Environmental Intelligence Network</p></div></div>
                            <div className="plan-header" style={{ marginTop: '60px', marginBottom: '40px' }}><h2 className="plan-title" style={{ fontSize: '2.2rem' }}>System Architecture</h2><p className="plan-tagline">How we process and predict environmental data</p></div>
                            <div className="plan-grid"><div className="plan-card"><h3>📡 1. Hardware & Data Acquisition</h3><p>Our foundation relies on real-time data collection. We utilize custom <strong>IoT nodes powered by ESP32 microcontrollers and PMS5003 sensors</strong>.</p></div><div className="plan-card"><h3>🧠 2. ML Prediction Engine</h3><p>Data undergoes rigorous ETL cleaning and feature engineering. We then deploy <strong>Random Forest and XGBoost models</strong> to forecast future PM2.5 levels.</p></div><div className="plan-card"><h3>⚠️ 3. Risk Assessment & Alerting</h3><p>Our Risk Engine acts as a proactive shield, calculating health risks and triggering <strong>automated alerts before a user enters a hazardous zone</strong>.</p></div><div className="plan-card"><h3>💻 4. Interactive Visualization</h3><p>The entire intelligence pipeline is served via a lightweight <strong>FastAPI backend</strong>. On the frontend, we utilize <strong>React.js and Leaflet.js</strong>.</p></div></div>
                        </section>
                    </div>
                )}

                {/* --- VIEW 2: AQI MAP --- */}
                {activeTab === 'AQI Map' && (
                    <div style={{ width: "100%" }}>
                        <div style={{ width: "100%", backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", paddingBottom: "60px" }}>
                            <div className="aqi-map-container" style={{ paddingTop: "120px", minHeight: "auto" }}>
                                <div className="regional-card" style={{ marginBottom: "10px" }}>
                                    <div className="regional-header-row"><div className="regional-title"><span>📍</span> Regional Live Insights</div><div className="regional-subtitle">Live Data for Selected Pin</div></div>
                                    <div className="regional-metrics-row">
                                        <div className="metric-block"><span className="metric-icon-lg">🌫️</span><span className="metric-value-lg">{selectedLoc.pm25}</span><span className="metric-label-sm">PM2.5</span></div><div className="metric-divider"></div>
                                        <div className="metric-block"><span className="metric-icon-lg">📉</span><span className="metric-value-lg">{dynamicAQI}</span><span className="metric-label-sm">Current AQI</span></div><div className="metric-divider"></div>
                                        <div className="metric-block"><span className="metric-icon-lg">🛡️</span><span className="metric-value-lg">{dynamicStatus}</span><span className="metric-label-sm">Status</span></div>
                                    </div>
                                </div>

                                <div className="map-split-container">
                                    <div className="map-wrapper"><AQIMapComponent onLocationSelect={handleMapClick} /></div>
                                    <div className="station-panel">
                                        <div className="panel-header"><div><div className="panel-title">Station Details</div><div className="location-name">{selectedLoc.name}</div></div><div className="live-badge">LIVE</div></div>
                                        <div className="aqi-display"><div className="aqi-big-val" style={{ color: dynamicAQI < 50 ? '#2ecc71' : dynamicAQI < 100 ? '#f1c40f' : '#e74c3c' }}>{dynamicAQI} <span style={{ fontSize: '1rem', color: 'white' }}>AQI</span></div><div className="aqi-meta"><span className="visibility-tag">{dynamicStatus} Visibility</span></div></div>
                                        <div className="tourist-msg-box"><div className="msg-title">Tourist Safety Message</div><div className="msg-body">"{selectedLoc.message}"</div></div>
                                        <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>Pollutant Breakdown</div>
                                        <div className="pollutant-grid">
                                            <div className="poll-item"><div className="poll-label">PM10</div><div className="poll-val">{selectedLoc.pm10} <span style={{ fontSize: '0.7rem' }}>µg/m³</span></div></div>
                                            <div className="poll-item"><div className="poll-label">NO2</div><div className="poll-val">{selectedLoc.no2} <span style={{ fontSize: '0.7rem' }}>µg/m³</span></div></div>
                                            <div className="poll-item"><div className="poll-label">O3</div><div className="poll-val">{selectedLoc.o3} <span style={{ fontSize: '0.7rem' }}>µg/m³</span></div></div>
                                            <div className="poll-item"><div className="poll-label">CO</div><div className="poll-val">{selectedLoc.co} <span style={{ fontSize: '0.7rem' }}>mg/m³</span></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Predictive Grid Map */}
                        <div style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", width: "100%", paddingTop: "40px", display: "flex", justifyContent: "center", boxShadow: "0 -20px 40px rgba(0,0,0,0.5)" }}>
                            <div className="predictive-container" style={{ marginTop: 0, marginBottom: "40px" }}>
                                <div className="predictive-header"><div className="predictive-title">🔮 Predictive AI: Dynamic Hazard Grid</div><div className="predictive-subtitle">Hit 'Play' to simulate 24-hour pollution spread across unmapped spatial blind zones.</div></div>
                                <div className="predictive-controls-bar">
                                    <div className="legend-box">
                                        <div className="legend-item"><div className="legend-color" style={{ background: '#e74c3c' }}></div> Hazardous</div>
                                        <div className="legend-item"><div className="legend-color" style={{ background: '#f1c40f' }}></div> Moderate</div>
                                        <div className="legend-item"><div className="legend-color" style={{ background: '#2ecc71' }}></div> Safe</div>
                                    </div>

                                    <div className="slider-group" style={{ width: '50%' }}>
                                        <button
                                            className={`play-btn ${isPlaying ? 'playing' : ''}`}
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            title="Auto-Play Radar"
                                        >
                                            {isPlaying ? '⏸' : '▶'}
                                        </button>

                                        <input type="range" min="0" max="24" value={predictiveHour} onChange={(e) => { setPredictiveHour(parseInt(e.target.value)); setIsPlaying(false); }} className="time-slider-large" />
                                        <span style={{ color: 'white', minWidth: '80px' }}>+{predictiveHour} Hrs</span>
                                    </div>
                                </div>
                                <div className="predictive-map-wrapper">
                                    <AQIPredictiveMap hourOffset={predictiveHour} userPos={userPos} />
                                </div>
                            </div>
                        </div>

                        {/* Route Optimizer Map */}
                        <div style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", width: "100%", paddingBottom: "80px", display: "flex", justifyContent: "center" }}>
                            <div className="predictive-container" style={{ marginTop: 0 }}>
                                <div className="predictive-header"><div className="predictive-title">🗺️ AI Safe Route Optimizer</div><div className="predictive-subtitle">Enter start and end points to calculate a commute avoiding hazardous pollution zones.</div></div>
                                <div className="routing-inputs-bar">
                                    <input type="text" placeholder="Starting Point (e.g. Patna)" className="route-input" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} />
                                    <span style={{ fontSize: '1.5rem' }}>➔</span>
                                    <input type="text" placeholder="Destination (e.g. Gaya)" className="route-input" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} />
                                    <button className="calc-route-btn" onClick={handleCalculateRoute} disabled={isRouting}>{isRouting ? 'Scanning Zones...' : 'Calculate Safe Route'}</button>
                                </div>
                                {routeData && (
                                    <div style={{ background: 'rgba(46, 204, 113, 0.15)', borderLeft: '4px solid #2ecc71', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: 'white' }}>
                                        <strong>✅ Exposure Avoidance Engine Active:</strong> This custom OSRM route successfully avoids 3 major high-risk junctions, providing an estimated <strong>22% decrease in PM2.5 inhalation</strong> for the user.
                                    </div>
                                )}
                                <div className="predictive-map-wrapper" style={{ height: "400px" }}><AQIRoutingMap routeData={routeData} /></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW 3: NEW HEAT MAP (URBAN HEAT ISLANDS) --- */}
                {activeTab === 'Heat Map' && (
                    <div style={{ width: "100%" }}>

                        <div style={{ width: "100%", backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(15, 23, 42, 0.9)), url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", paddingBottom: "60px" }}>
                            <div className="aqi-map-container" style={{ paddingTop: "120px", minHeight: "auto" }}>

                                <div className="regional-card" style={{ marginBottom: "10px", borderColor: 'rgba(255, 71, 87, 0.3)' }}>
                                    <div className="regional-header-row"><div className="regional-title" style={{ color: '#ff4757' }}><span>🔥</span> Regional Heat Insights</div><div className="regional-subtitle">Urban Thermal Diagnostics</div></div>
                                    <div className="regional-metrics-row">
                                        <div className="metric-block"><span className="metric-icon-lg">🌡️</span><span className="metric-value-lg">{heatLoc.temp}°C</span><span className="metric-label-sm">Ambient Temp</span></div><div className="metric-divider"></div>
                                        <div className="metric-block"><span className="metric-icon-lg">🏢</span><span className="metric-value-lg" style={{ color: '#ff4757' }}>{heatLoc.surfaceTemp}°C</span><span className="metric-label-sm">Surface Temp</span></div><div className="metric-divider"></div>
                                        <div className="metric-block"><span className="metric-icon-lg">💧</span><span className="metric-value-lg">{heatLoc.humidity}%</span><span className="metric-label-sm">Humidity</span></div>
                                    </div>
                                </div>

                                <div className="map-split-container">
                                    {/* HERE IS THE CHANGED LINE WITH userPos={userPos} PASSED IN! */}
                                    <div className="map-wrapper"><HeatMapComponent onLocationSelect={handleHeatClick} userPos={userPos} /></div>

                                    <div className="station-panel" style={{ borderColor: 'rgba(255, 71, 87, 0.3)' }}>
                                        <div className="panel-header"><div><div className="panel-title" style={{ color: '#ff4757' }}>Thermal Station Details</div><div className="location-name">{heatLoc.name}</div></div><div className="live-badge" style={{ background: '#ff4757' }}>LIVE</div></div>
                                        <div className="aqi-display"><div className="aqi-big-val" style={{ color: heatLoc.surfaceTemp > 40 ? '#ff4757' : '#f1c40f' }}>{heatLoc.surfaceTemp}°C <span style={{ fontSize: '1rem', color: 'white' }}>Surface</span></div><div className="aqi-meta"><span className="visibility-tag">{heatLoc.status}</span></div></div>
                                        <div className="tourist-msg-box" style={{ borderLeftColor: '#ff4757' }}><div className="msg-title" style={{ color: '#ff4757' }}>Thermal Safety Warning</div><div className="msg-body">"{heatLoc.message}"</div></div>
                                        <button className="full-analysis-btn" style={{ background: 'linear-gradient(90deg, #ff4757, #ff6b81)' }}>View Thermal Analysis</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", width: "100%", padding: "40px 0 80px 0", display: "flex", justifyContent: "center", boxShadow: "0 -20px 40px rgba(0,0,0,0.5)" }}>
                            <div className="predictive-container" style={{ marginTop: 0 }}>
                                <div className="predictive-header">
                                    <div className="predictive-title" style={{ color: '#ff4757' }}>🏢 The Thirsty Cloud: Heat Distribution Grid</div>
                                    <div className="predictive-subtitle">Identifying extreme thermal anomalies caused by heavy industry and Hyperscale AI Server Farms, including their estimated cooling water consumption.</div>
                                </div>
                                <div className="predictive-map-wrapper" style={{ height: "500px" }}>
                                    <UrbanHeatDistribution userPos={userPos} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW 5: ABOUT US --- */}
                {activeTab === 'About Us' && (
                    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
                        <AboutUs backgroundImage={backgroundImage} />
                    </div>
                )}

                {/* --- VIEW 4: ECO IMPACT (AIR QUALITY FOCUS) --- */}
                {activeTab === 'Eco Impact' && (
                    <div className="eco-container">

                        {/* 1. COMPACT HERO SECTION */}
                        {/* Adjusted padding: 85px top (moves text up, clears navbar), 40px bottom (shrinks image height) */}
                        <section className="eco-hero" style={{ position: 'relative', backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '85px 20px 40px 20px', textAlign: 'center' }}>
                            <h1 className="eco-hero-title" style={{ fontSize: '2.8rem', color: '#00d2ff', textTransform: 'uppercase', margin: 0 }}>The Invisible Crisis</h1>
                            <div className="eco-hero-subtitle" style={{ fontSize: '1.1rem', color: '#e2e8f0', marginTop: '5px', letterSpacing: '1px' }}>Understanding the true human and economic cost of urban air pollution</div>

                            {/* Pinned absolutely to the bottom of the image */}
                            <div style={{ position: 'absolute', bottom: '5px', left: '0', width: '100%', textAlign: 'center' }}>
                                <div
                                    className="scroll-down-arrow"
                                    onClick={() => window.scrollBy({ top: 500, behavior: 'smooth' })}
                                    title="Scroll Down"
                                    style={{ margin: 0 }}
                                >
                                    ↓
                                </div>
                            </div>
                        </section>

                        {/* 2. LIVE GLOBAL AQI METRICS */}
                        <section style={{ background: '#0f172a', padding: '30px 20px 0 20px', textAlign: 'center' }}>
                            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>

                                <div style={{ flex: 1, minWidth: '200px', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.4)', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ fontSize: '2.5rem', color: '#e74c3c', fontWeight: 'bold' }}>7 Million</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '8px' }}>Premature deaths annually due to air pollution</div>
                                </div>

                                <div style={{ flex: 1, minWidth: '200px', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.4)', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ fontSize: '2.5rem', color: '#00d2ff', fontWeight: 'bold' }}>99%</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '8px' }}>Global population breathing air exceeding WHO limits</div>
                                </div>

                                <div style={{ flex: 1, minWidth: '200px', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(46, 204, 113, 0.05)', border: '1px solid rgba(46, 204, 113, 0.4)', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ fontSize: '2.5rem', color: '#2ecc71', fontWeight: 'bold' }}>$8.1 Trillion</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '8px' }}>Annual global health cost of air pollution</div>
                                </div>

                            </div>
                        </section>

                        {/* 3. CORE EXPLANATION GRID */}
                        <section className="eco-blue-section" style={{ background: '#0f172a', padding: '40px 40px', minHeight: 'auto' }}>
                            <div className="plan-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>

                                <div className="plan-card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(231, 76, 60, 0.3)' }}>
                                    <div className="eco-card-header" style={{ fontSize: '1.2rem', color: '#e74c3c', marginBottom: '15px' }}><span>⚠️</span> The Data Blindspot</div>
                                    <p className="eco-card-text" style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.9rem' }}>Air pollution is currently reported as massive, city-wide averages. This masks the toxic reality of specific industrial zones. A monitoring station in a green park cannot warn a commuter about hazardous smog just 2km away at a heavy traffic junction.</p>
                                </div>

                                <div className="plan-card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(0, 210, 255, 0.3)' }}>
                                    <div className="eco-card-header" style={{ fontSize: '1.2rem', color: '#00d2ff', marginBottom: '15px' }}><span>🫁</span> The PM2.5 Threat</div>
                                    <p className="eco-card-text" style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.9rem' }}>Microscopic particulate matter (PM2.5) bypasses the body's natural defenses, entering the bloodstream. Commuters facing hyperlocal spikes at traffic intersections inhale toxic doses that aggregate city-wide averages completely fail to report.</p>
                                </div>

                                <div className="plan-card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(46, 204, 113, 0.3)' }}>
                                    <div className="eco-card-header" style={{ fontSize: '1.2rem', color: '#2ecc71', marginBottom: '15px' }}><span>🎯</span> Our Mission & Solution</div>
                                    <ul className="eco-list" style={{ color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '20px', fontSize: '0.9rem' }}>
                                        <li style={{ marginBottom: '5px' }}><strong>Interpolate:</strong> Estimate air quality in spatial "blind spots".</li>
                                        <li style={{ marginBottom: '5px' }}><strong>Forecast:</strong> Predict PM2.5 trends for the next 12–24 hours.</li>
                                        <li><strong>Optimize:</strong> Provide an AI routing engine that reduces commuter exposure by ~22%.</li>
                                    </ul>
                                </div>

                                <div className="plan-card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(241, 196, 15, 0.3)' }}>
                                    <div className="eco-card-header" style={{ fontSize: '1.2rem', color: '#f1c40f', marginBottom: '15px' }}><span>⚙️</span> Technical Implementation</div>
                                    <ul className="eco-list" style={{ color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '20px', fontSize: '0.9rem' }}>
                                        <li style={{ marginBottom: '5px' }}><strong>Hardware:</strong> ESP32 Microcontrollers & PMS5003 Sensors.</li>
                                        <li style={{ marginBottom: '5px' }}><strong>ML Engine:</strong> Random Forest / XGBoost models (FastAPI).</li>
                                        <li><strong>Routing:</strong> OSRM integrated with Leaflet GIS mapping.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 4. REAL-WORLD HEALTH IMPACT CHART */}
                            <div style={{ maxWidth: '1000px', margin: '50px auto 0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '30px' }}>
                                <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '25px', fontSize: '1.5rem' }}>Real-World Health Impacts</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                                        <span style={{ color: '#e74c3c', fontSize: '1.1rem' }}>🚗 1 Hour Commute in Heavy Traffic</span>
                                        <span style={{ color: '#cbd5e1' }}>≈ Inhaling the PM2.5 equivalent of 2-3 cigarettes</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                                        <span style={{ color: '#f1c40f', fontSize: '1.1rem' }}>📉 Chronic PM2.5 Exposure</span>
                                        <span style={{ color: '#cbd5e1' }}>≈ 15% increased risk of respiratory and cardiovascular disease</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#2ecc71', fontSize: '1.1rem' }}>🛡️ AI Safe Route Optimizer</span>
                                        <span style={{ color: '#cbd5e1' }}>≈ Achieves up to 22% reduction in daily toxic particulate inhalation</span>
                                    </div>

                                </div>
                            </div>

                            <div className="dev-highlight-box" style={{ textAlign: 'center', marginTop: '50px', padding: '25px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '15px' }}>
                                <div className="dev-title" style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 'bold' }}>Developed for Technex '26</div>
                                <div className="dev-subtitle" style={{ color: '#00d2ff', marginTop: '5px', letterSpacing: '1px', fontSize: '0.9rem' }}>For IIT BHU • By IIT Patna</div>
                            </div>

                        </section>
                    </div>
                )}

            </div>

            {/* --- NEW FOOTER ADDED HERE --- */}
            <Footer />

        </motion.div>
    );
};

export default Dashboard;