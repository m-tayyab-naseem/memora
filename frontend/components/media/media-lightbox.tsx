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

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-800"
                        onClick={() => {
                            const link = document.createElement("a");
                            link.href = currentMedia.url;
                            link.download = `memory-${currentMedia.id}`;
                            link.click();
                        }}
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-800"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Media Display */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                    {currentMedia.type === "photo" ? (
                        <Image
                            src={currentMedia.url || "/placeholder.svg"}
                            alt={currentMedia.caption || "Memory"}
                            fill
                            className="object-contain"
                            priority
                        />
                    ) : (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <video
                                src={currentMedia.url}
                                controls
                                className="max-w-full max-h-full"
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

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-800"
                        onClick={handlePrevious}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-800"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-5 w-5" />
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
