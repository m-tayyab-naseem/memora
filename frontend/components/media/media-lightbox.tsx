"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, X, Info, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUi } from "@/context/ui-context";

interface MediaLightboxProps {
    media: MediaItem[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export function MediaLightbox({
    media,
    initialIndex,
    isOpen,
    onClose,
}: MediaLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
    const { setIsImmersive } = useUi();
    const [showControls, setShowControls] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
        };

        const handleFullscreenChange = () => {
            // If we exit fullscreen, close the lightbox
            if (!document.fullscreenElement && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            setIsImmersive(true);
            document.addEventListener("fullscreenchange", handleFullscreenChange);

            // Enter fullscreen on the container
            if (containerRef.current && !document.fullscreenElement) {
                containerRef.current.requestFullscreen().catch((err) => {
                    console.error("Fullscreen request failed:", err);
                });
            }
        } else {
            setIsImmersive(false);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            setIsImmersive(false);
        };
    }, [isOpen, onClose, setIsImmersive]);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const handlePrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    const currentMedia = media[currentIndex];

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden touch-none selection:bg-none"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
                setShowControls(!showControls);
            }}
        >
            {/* Top Bar Overlay */}
            <div
                className={`fixed top-0 left-0 right-0 z-[110] flex items-center justify-between p-4 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                    <div className="hidden sm:block">
                        <h2 className="text-sm font-medium text-white truncate max-w-md">
                            {currentMedia.caption || "Untitled Memory"}
                        </h2>
                        <p className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(currentMedia.memoryDate || currentMedia.uploadedAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center"
                        onClick={() => {
                            const link = document.createElement("a");
                            link.href = currentMedia.url;
                            link.download = `memory-${currentMedia.id}`;
                            link.click();
                        }}
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10 hidden sm:flex items-center justify-center">
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10 hidden sm:flex items-center justify-center">
                        <Info className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Media Viewport */}
            <div className="relative w-full h-full flex items-center justify-center bg-black focus:outline-none select-none">
                {currentMedia.type === "photo" ? (
                    <div className="relative w-full h-full p-0 sm:p-2 animate-in fade-in zoom-in-95 duration-500">
                        <Image
                            src={currentMedia.url || "/placeholder.svg"}
                            alt={currentMedia.caption || "Memory"}
                            fill
                            className="object-contain"
                            priority
                            draggable={false}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                        <video
                            src={currentMedia.url}
                            controls
                            className="max-w-full max-h-full"
                            autoPlay
                        />
                    </div>
                )}

                {/* Fullscreen Navigation Buttons */}
                {media.length > 1 && (
                    <>
                        <button
                            className={`fixed left-6 top-1/2 -translate-y-1/2 z-[110] text-white/40 hover:text-white bg-black/10 hover:bg-black/30 p-4 rounded-full transition-all duration-300 backdrop-blur-sm ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={handlePrevious}
                        >
                            <ChevronLeft className="h-10 w-10" />
                        </button>
                        <button
                            className={`fixed right-6 top-1/2 -translate-y-1/2 z-[110] text-white/40 hover:text-white bg-black/10 hover:bg-black/30 p-4 rounded-full transition-all duration-300 backdrop-blur-sm ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-10 w-10" />
                        </button>
                    </>
                )}
            </div>

            {/* Info & Metadata Overlay */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[110] flex flex-col items-center p-8 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-[10px] font-bold text-white/70 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-lg border border-white/10 tracking-[0.2em] uppercase">
                    {currentIndex + 1} / {media.length}
                </div>

                {currentMedia.tags && currentMedia.tags.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar px-4 pb-2">
                        {currentMedia.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[9px] bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/5 whitespace-nowrap"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
