// src/Welcome.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Welcome.css';

const Welcome = ({ onStart }) => {
    const phrases = [
        "System Initializing...",
        "Mapping Spatial Blind Spots...",
        "Calibrating 24-Hour Predictive ML Models...",
        "Locating Hyperscale Thermal Anomalies...",
        "Optimizing Safe Commute Routes...",
        "Intelligence Engine Ready."
    ];

    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <div className="welcome-container">

            {/* NEW: Tech Grid Background */}
            <div className="tech-grid"></div>

            {/* Decorative Floating Nodes */}
            <div className="floating-node node-1"></div>
            <div className="floating-node node-2"></div>
            <div className="floating-node node-3"></div>

            {/* Main Center Box */}
            <motion.div
                className="welcome-content"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                {/* NEW: HUD Targeting Corners */}
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                {/* NEW: Holographic Scan Line */}
                <div className="scan-line"></div>

                <motion.h1
                    className="welcome-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    Unstoppables '26
                </motion.h1>

                <motion.div
                    className="welcome-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    The Breath-Analyzer
                </motion.div>

                <div className="dynamic-text-container">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={phraseIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                        >
                            {phrases[phraseIndex]}
                        </motion.span>
                    </AnimatePresence>
                </div>

                <motion.button
                    className="start-btn"
                    onClick={onStart}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ACCESS INTELLIGENCE HUD
                </motion.button>

                <motion.div
                    className="feature-preview-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <div className="feature-pill" onClick={onStart}> ML Forecasting</div>
                    <div className="feature-pill" onClick={onStart}> Safe Route AI</div>
                    <div className="feature-pill" onClick={onStart}> Thermal Diagnostics</div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Welcome;