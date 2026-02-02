"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the state shapes
interface VideoStudioState {
  file: File | null;
  previewUrl: string | null;
  analysisResult: any | null;
  activeTab: string;
}

interface StyleStudioState {
  file: File | null;
  previewUrl: string | null;
  analysisResult: any | null;
}

interface StudioContextType {
  videoState: VideoStudioState;
  setVideoState: React.Dispatch<React.SetStateAction<VideoStudioState>>;
  styleState: StyleStudioState;
  setStyleState: React.Dispatch<React.SetStateAction<StyleStudioState>>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [videoState, setVideoState] = useState<VideoStudioState>({
    file: null,
    previewUrl: null,
    analysisResult: null,
    activeTab: "report",
  });

  // Initialize styleState from localStorage if available
  const [styleState, setStyleState] = useState<StyleStudioState>(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("styleState");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Note: File object cannot be restored from localStorage, only metadata/url
                // So 'file' will be null, but previewUrl (base64) and analysisResult will be there
                return parsed;
            } catch (e) {
                console.error("Failed to parse styleState", e);
            }
        }
    }
    return {
        file: null,
        previewUrl: null,
        analysisResult: null,
    };
  });

  // Persist styleState to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
        // Exclude File object as it's not serializable
        const stateToSave = {
            ...styleState,
            file: null // Don't save File object
        };
        localStorage.setItem("styleState", JSON.stringify(stateToSave));
    }
  }, [styleState]);

  return (
    <StudioContext.Provider value={{ videoState, setVideoState, styleState, setStyleState }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
}
