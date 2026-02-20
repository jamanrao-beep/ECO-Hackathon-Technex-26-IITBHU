// src/AboutUs.js
import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';
import amanPhoto from './2501EE41.jpeg';
import nehaPhoto from './neha.jpeg';
import mahaPhoto from './mahalakshmi.png';
import krishnaPhoto from './KTA.jpg'; // Placeholder for Krishna's photo

const AboutUs = ({ backgroundImage }) => {
    return (
        <div className="about-container">

            {/* Top Half: Image Background */}
            <div
                className="about-hero"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(15, 23, 42, 0.9)), url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="about-title">Technex '26 | IIT BHU</h1>
                    <div className="about-subtitle">Sustainable Innovation for Urban Environments</div>
                    <p className="about-desc">
                        Developed for the Eco Hackathon, engineered a machine-learning powered solution to monitor real-time air quality and hyperscale thermal anomalies. Bridging the gap between invisible environmental data and actionable public safety.
                    </p>

                    <div className="stats-row">
                        <div className="stat-badge"><span>🎓</span> Undergraduate Project</div>
                        <div className="stat-badge"><span>📍</span> IIT Patna</div>
                        <div className="stat-badge" style={{ borderColor: '#2ecc71', color: '#2ecc71' }}><span>✅</span> Prototype Live</div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Half: Dark Blue Background */}
            <div className="about-content-section">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <h2 className="team-section-title">Meet Our Team</h2>

                    {/* The 4 Alternating Team Cards */}
                    <div className="team-cards-container">

                        {/* 1. Aman (ULTIMATE VIP CARD) */}
                        <div className="profile-card leader-card">
                            <div className="profile-info">
                                <div className="profile-name">
                                    Joginapally Aman Rao
                                    <span className="live-status-dot" title="Architect Online"></span>
                                </div>

                                <div className="profile-role" style={{ lineHeight: '1.4' }}>
                                    {/* NEW: Added glitch-text class here */}
                                    <span className="glitch-text" style={{ color: '#fcbe04', fontSize: '1.25rem' }}>Team Leader</span><br />
                                    Full-Stack & ML Engineer
                                </div>

                                <div className="profile-desc">
                                    Spearheads the overall project vision and machine learning architecture. Aman single-handedly developed the complete interactive React application, seamlessly integrating complex GIS mapping with the ML predictive models to create a highly immersive, real-time environmental command center.
                                </div>

                                <div className="social-links">
                                    <a href="https://www.instagram.com/amanj_2029/" target="_blank" rel="noreferrer" className="insta-link">
                                        @amanj_2029
                                    </a>
                                </div>
                            </div>

                            {/* NEW: Added className="vip-photo-wrapper" to this div */}
                            <div className="vip-photo-wrapper" style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                                <div className="leader-badge">✦ Project Lead</div>

                                <div className="profile-photo-container">
                                    <img src={amanPhoto} alt="Joginapally Aman Rao" className="profile-photo leader-photo" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Neha */}
                        <div className="profile-card reverse">
                            <div className="profile-info">
                                <div className="profile-name">Perumalla Neha</div>
                                <div className="profile-role">Design & Machine Learning Engineer</div>
                                <div className="profile-desc">
                                    Co-architects the core machine learning predictive algorithms alongside Aman. Neha processes complex localized meteorological datasets to train and refine the Random Forest and XGBoost models, ensuring the engine can accurately forecast localized pollution spikes 24 hours in advance.
                                </div>

                                <div className="social-links">
                                    <a href="https://www.instagram.com/neha_perumalla/" target="_blank" rel="noreferrer" className="insta-link">
                                        @nehaperumalla_insta
                                    </a>
                                </div>
                            </div>
                            <div className="profile-photo-container">
                                <img src={nehaPhoto} alt="Perumalla Neha" className="profile-photo" />
                            </div>
                        </div>

                        {/* 3. Mahalakshmi */}
                        <div className="profile-card">
                            <div className="profile-info">
                                <div className="profile-name">Mahalakshmi Pattamsetti</div>
                                <div className="profile-role">Hardware Simulations & IoT Engineer</div>
                                <div className="profile-desc">
                                    Leads the critical hardware simulation environments and backend infrastructure. Mahalakshmi validates the sensor data pipelines virtually before physical deployment, and engineered the robust FastAPI services that connect the hardware data streams to the frontend dashboard.
                                </div>

                                <div className="social-links">
                                    <a href="https://www.instagram.com/pattamsetti__99/" target="_blank" rel="noreferrer" className="insta-link">
                                        @mahalakshmi_insta
                                    </a>
                                </div>
                            </div>
                            <div className="profile-photo-container">
                                <img src={mahaPhoto} alt="Mahalakshmi Pattamsetti" className="profile-photo" />
                            </div>
                        </div>

                        {/* 4. Krishna Teja */}
                        <div className="profile-card reverse">
                            <div className="profile-info">
                                <div className="profile-name">Krishna Teja Degala</div>
                                <div className="profile-role">IoT & Hardware Specialist</div>
                                <div className="profile-desc">
                                    Constructs and calibrates the physical data acquisition layer. Krishna integrates ESP32 microcontrollers with PMS5003 particulate sensors, ensuring the remote nodes successfully withstand urban conditions and transmit high-fidelity, real-time pollution data into the ecosystem.
                                </div>

                                <div className="social-links">
                                    <a href="#" target="_blank" rel="noreferrer" className="insta-link">
                                        @KrishnaTeja_insta
                                    </a>
                                </div>
                            </div>
                            <div className="profile-photo-container">
                                <img src={krishnaPhoto} alt="Krishna Teja Degala" className="profile-photo" />
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* --- NEW HACKATHON SHOWCASE BOX --- */}
                <div className="hackathon-showcase">
                    <div className="showcase-title">Developed for <span>Technex '26</span></div>

                    <p className="showcase-desc">
                        The Eco Hackathon at IIT BHU challenged students to solve real-world urban sustainability and environmental issues. Our response, <strong>Pro Atmos Guard</strong>, is a decentralized, machine-learning powered monitoring network built with predictive resilience and spatial scalability at its core.
                    </p>

                    <div className="showcase-badge">
                        <span>🏆</span> Eco Hackathon Finalist Team
                    </div>

                    <div className="showcase-tech-row">
                        <div className="tech-item">
                            <div className="tech-icon">📡</div>
                            <span>IoT Network</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">☁️</div>
                            <span>Cloud Infrastructure</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">📈</div>
                            <span>ML Analytics</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">🗺️</div>
                            <span>GIS Spatial Graph</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">⚙️</div>
                            <span>Hardware Integration</span>
                        </div>
                    </div>
                </div>

            </div> {/* End of about-content-section */}
        </div>
    );
};

export default AboutUs;