// src/Navbar.js
import React from 'react';
import './Navbar.css';
import { motion } from 'framer-motion';

// Now accepts props from Dashboard to control the state
const Navbar = ({ activeTab, setActiveTab }) => {

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
                <div className="logo-placeholder"></div>
                <div className="title-stack">
                    <span className="main-title">PRO ATMOS GUARD</span>
                    <span className="sub-title">IIT PATNA</span>
                </div>
            </div>

            {/* Navigation Links */}
            <ul className="nav-links">
                {navLinks.map((link) => (
                    <li
                        key={link}
                        className={`nav-item ${activeTab === link ? 'active' : ''}`}
                        // When clicked, tell Dashboard to switch the tab
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
                    placeholder="Search location..."
                    className="search-input"
                />
                <span className="search-icon">🔍</span>
            </div>
        </nav>
    );
};

export default Navbar;