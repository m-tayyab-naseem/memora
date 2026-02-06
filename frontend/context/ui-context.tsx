"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UiContextType {
    isImmersive: boolean;
    setIsImmersive: (value: boolean) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
    const [isImmersive, setIsImmersive] = useState(false);

    return (
        <UiContext.Provider value={{ isImmersive, setIsImmersive }}>
            {children}
        </UiContext.Provider>
    );
}

export function useUi() {
    const context = useContext(UiContext);
    if (context === undefined) {
        throw new Error("useUi must be used within a UiProvider");
    }
    return context;
}
