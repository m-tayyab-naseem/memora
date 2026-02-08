"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Settings {
    compactMode: boolean;
    autoPlay: boolean;
    notifications: boolean;
}

interface SettingsContextType extends Settings {
    setCompactMode: (value: boolean) => void;
    setAutoPlay: (value: boolean) => void;
    setNotifications: (value: boolean) => void;
    saveSettings: (settings: Settings) => void;
    resetToDefaults: () => void;
}

const defaultSettings: Settings = {
    compactMode: false,
    autoPlay: true,
    notifications: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("memora-settings");
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setMounted(true);
    }, []);

    const setCompactMode = (compactMode: boolean) => setSettings(s => ({ ...s, compactMode }));
    const setAutoPlay = (autoPlay: boolean) => setSettings(s => ({ ...s, autoPlay }));
    const setNotifications = (notifications: boolean) => setSettings(s => ({ ...s, notifications }));

    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem("memora-settings", JSON.stringify(newSettings));
    };

    const resetToDefaults = () => {
        saveSettings(defaultSettings);
    };

    if (!mounted) return null;

    return (
        <SettingsContext.Provider
            value={{
                ...settings,
                setCompactMode,
                setAutoPlay,
                setNotifications,
                saveSettings,
                resetToDefaults
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
