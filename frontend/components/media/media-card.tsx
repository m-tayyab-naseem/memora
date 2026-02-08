"use client";

import { useState, memo, useMemo, useRef } from "react";
import Image from "next/image";
import { MediaItem, UserRole } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Play, ImageIcon } from "lucide-react";

interface MediaCardProps {
  media: MediaItem;
  vaultId: string;
  userRole?: UserRole;
  onDeleted: (mediaId: string) => void;
  onOpen?: () => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: "justified" | "square";
}

export const MediaCard = memo(function MediaCard({
  media,
  vaultId,
  userRole,
  onDeleted,
  onOpen,
  className = "",
  style = {},
  variant = "justified"
}: MediaCardProps) {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { autoPlay } = useSettings();

  // Aspect ratio calculation for justified layout
  const aspect = useMemo(() => {
    if (media.metadata?.width && media.metadata?.height) {
      return media.metadata.width / media.metadata.height;
    }
    return 1;
  }, [media.metadata]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiClient.deleteMedia(vaultId, media.id);
      onDeleted(media.id);
    } catch (err) {
      console.error("Failed to delete media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (autoPlay && media.type === "video" && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    if (media.type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden bg-muted cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-violet-500/50 ${variant === "square" ? "aspect-square rounded-xl" : ""} ${className}`}
      style={{
        ...style,
        flexGrow: variant === "justified" ? aspect : undefined,
        flexBasis: variant === "justified" ? `${aspect * 180}px` : undefined,
      }}
      onClick={onOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Content */}
      <div className="absolute inset-0">
        {media.type === "photo" ? (
          <Image
            src={media.url || "/placeholder.svg"}
            alt={media.caption || "Gallery item"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={media.url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              preload="metadata"
              muted
              playsInline
              loop
            />
            {/* Center Play Button for Video - hidden when playing */}
            <div className={`absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors ${isPlaying ? "opacity-0" : "opacity-100"}`}>
              <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/20 transform group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover States: Single Overlay for Actions */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-transparent to-black/20 p-2">
        <div className="h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            {/* Type indicator - top left */}
            <div className="p-1 rounded-md bg-black/30 backdrop-blur-sm border border-white/10">
              {media.type === "photo" ? (
                <ImageIcon className="h-3.5 w-3.5 text-white/90" />
              ) : (
                <Play className="h-3.5 w-3.5 text-white/90" />
              )}
            </div>

            {/* Delete button - top right - Only for non-viewers */}
            {userRole !== "viewer" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white/70 hover:text-red-500 hover:bg-white/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this {media.type} from your vault.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 justify-end mt-4">
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Caption - bottom */}
          {media.caption && (
            <div className="px-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-xs font-medium truncate drop-shadow-sm">
                {media.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
