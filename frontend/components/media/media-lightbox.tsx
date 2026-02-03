"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

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

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, currentIndex, media.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    const currentMedia = media[currentIndex];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white truncate">
                        {currentMedia.caption || "Untitled Memory"}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                        <span>
                            {formatDistanceToNow(new Date(currentMedia.memoryDate || currentMedia.uploadedAt), {
                                addSuffix: true,
                            })}
                        </span>
                        {currentMedia.uploadedByName && (
                            <>
                                <span>•</span>
                                <span>Added by {currentMedia.uploadedByName}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-12 w-12 rounded-full backdrop-blur-md"
                        onClick={() => {
                            const link = document.createElement("a");
                            link.href = currentMedia.url;
                            link.download = `memory-${currentMedia.id}`;
                            link.click();
                        }}
                    >
                        <Download className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-red-600/80 hover:bg-red-600 h-12 w-12 rounded-full backdrop-blur-md border border-white/20 shadow-xl"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Media Display */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
                <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
                    {currentMedia.type === "photo" ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={currentMedia.url || "/placeholder.svg"}
                                alt={currentMedia.caption || "Memory"}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <video
                                src={currentMedia.url}
                                controls
                                className="max-w-full max-h-full rounded-lg shadow-2xl"
                                autoPlay
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with Navigation */}
            <div className="flex items-center justify-between p-4 border-t border-slate-700">
                <div className="text-sm text-slate-300">
                    {currentIndex + 1} / {media.length}
                </div>

                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-white/10 hover:bg-white/20 h-14 w-14 rounded-full backdrop-blur-lg border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-white/10 hover:bg-white/20 h-14 w-14 rounded-full backdrop-blur-lg border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                </div>

                <div className="flex items-center gap-1 flex-wrap justify-end max-w-xs">
                    {currentMedia.tags && currentMedia.tags.length > 0 && (
                        currentMedia.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs bg-violet-600/20 text-violet-200 px-2 py-1 rounded"
                            >
                                #{tag}
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
