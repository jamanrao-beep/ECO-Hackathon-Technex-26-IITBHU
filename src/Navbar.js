// src/Navbar.js
import React from 'react';
import './Navbar.css';
import { motion } from 'framer-motion';
import projectLogo from './logotrial.jpg';

const Navbar = ({ activeTab, setActiveTab, userLocation }) => {

    const navLinks = [
        'Overview',
        'AQI Map',
        'Heat Map',
        'About Us',
        'Eco Impact'
    ];

    return (
        <nav className="navbar">
            {/* Brand Section */}
            <div className="brand-container">

                <img
                    src={projectLogo}
                    alt="Pro Atmos Guard Logo"
                    className="brand-logo-img"
                    /* Increased height to 50px and added a bit more margin */
                    style={{ height: '50px', marginRight: '15px', filter: 'drop-shadow(0 0 5px #00d2ff)' }}
                />
                <div className="title-stack">
                    <span className="main-title">PRO ATMOS GUARD</span>
                    {/* Updated Subtitle with the Blue Dot */}
                    <div className="sub-title">
                        <span>IIT PATNA</span>
                        <span className="blue-dot"></span>
                        <span>TECHNEX '26</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <ul className="nav-links">
                {navLinks.map((link) => (
                    <li
                        key={link}
                        className={`nav-item ${activeTab === link ? 'active' : ''}`}
                        onClick={() => setActiveTab(link)}
                    >
                        {link}
                        {activeTab === link && (
                            <motion.div
                                className="underline"
                                layoutId="underline"
                            />
                        )}
                    </li>
                ))}
            </ul>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder={userLocation}
                    className="search-input"
                />
                <span className="search-icon">🔍</span>
            </div>
        </nav>
    );
};

export default Navbar;