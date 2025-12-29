'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

export const GojoVoid = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        y: [0, -40],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

export const SukunaShrine = () => {
    const embers = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 10,
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_70%)]" />
            {embers.map((e) => (
                <motion.div
                    key={e.id}
                    className="absolute rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                    style={{
                        left: `${e.x}%`,
                        top: `${e.y}%`,
                        width: e.size,
                        height: e.size,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [1, 2, 1],
                        y: [0, -120],
                        x: [0, (Math.random() - 0.5) * 50],
                    }}
                    transition={{
                        duration: e.duration,
                        repeat: Infinity,
                        delay: e.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export const SukunaSlash = ({ trigger }: { trigger: boolean }) => {
    const slashes = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        rotate: Math.random() * 360,
        top: Math.random() * 80 + 10,
        left: Math.random() * 80 + 10,
        delay: i * 0.1,
    }));

    return (
        <AnimatePresence>
            {trigger && (
                <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
                    {slashes.map((s) => (
                        <motion.div
                            key={s.id}
                            initial={{ width: 0, opacity: 1 }}
                            animate={{ width: "120%", opacity: [1, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, delay: s.delay, ease: "circOut" }}
                            className="absolute h-[2px] bg-white shadow-[0_0_15px_#fff]"
                            style={{
                                transform: `rotate(${s.rotate}deg)`,
                                top: `${s.top}%`,
                                left: "-10%",
                            }}
                        />
                    ))}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-red-600/20 mix-blend-overlay"
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export const DomainExpansion = ({ theme, children }: { theme: 'gojo' | 'sukuna', children: React.ReactNode }) => {
    return (
        <motion.div
            animate={{
                backgroundColor: theme === 'gojo' ? '#0f172a' : '#1a0b0b'
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="relative min-h-screen"
        >
            <AnimatePresence mode="wait">
                {theme === 'gojo' ? (
                    <motion.div
                        key="gojo-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <GojoVoid />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sukuna-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <SukunaShrine />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
