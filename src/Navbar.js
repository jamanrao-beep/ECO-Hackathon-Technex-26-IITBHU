// src/Navbar.js
import React, { useState } from 'react';
import './Navbar.css';
import { motion } from 'framer-motion';
import projectLogo from './logotrial.jpg';

const Navbar = ({ activeTab, setActiveTab, userLocation }) => {
    // State for mobile menu toggle
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    style={{ height: '50px', marginRight: '15px', filter: 'drop-shadow(0 0 5px #00d2ff)' }}
                />
                <div className="title-stack">
                    <span className="main-title">PRO ATMOS GUARD</span>
                    <div className="sub-title">
                        <span>IIT PATNA</span>
                        <span className="blue-dot"></span>
                        <span>TECHNEX '26</span>
                    </div>
                </div>
            </div>

            {/* Hamburger Button (Only visible on Mobile) */}
            <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? '✖' : '☰'}
            </div>

            {/* Navigation Links */}
            <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
                {navLinks.map((link) => (
                    <li
                        key={link}
                        className={`nav-item ${activeTab === link ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(link);
                            setIsMobileMenuOpen(false); // Auto-close on click
                        }}
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
            <div className={`search-container ${isMobileMenuOpen ? 'mobile-hidden' : ''}`}>
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