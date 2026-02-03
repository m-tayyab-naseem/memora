"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { MediaItem } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
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
import { formatDistanceToNow } from "date-fns";

interface MediaCardProps {
  media: MediaItem;
  vaultId: string;
  onDeleted: (mediaId: string) => void;
  onOpen?: () => void;
}

export const MediaCard = memo(function MediaCard({ media, vaultId, onDeleted, onOpen }: MediaCardProps) {
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
      onClick={onOpen}
    >
      {media.type === "photo" ? (
        <>
          <Image
            src={media.url || "/placeholder.svg"}
            alt={media.caption || "Gallery item"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
        </>
      ) : (
        <>
          <video
            src={media.url}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
            <div className="bg-indigo-600 p-6 rounded-full shadow-2xl transform group-hover:scale-125 transition-all duration-500 ring-8 ring-white/10">
              <Play className="h-12 w-12 text-white fill-white" />
            </div>
          </div>
        </>
      )}

      {/* Caption overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-end justify-between p-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 bg-white/10 hover:bg-red-500 border-white/20 text-white rounded-full backdrop-blur-md shadow-lg transition-colors border-none"
              onClick={(e) => {
                e.stopPropagation();
              }}
              disabled={loading}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Media</AlertDialogTitle>
              <AlertDialogDescription>
                This media will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end items-center mt-6">
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="bg-red-600 hover:bg-red-700 px-6"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Info at bottom */}
        <div className="w-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          {media.caption && (
            <h4 className="font-bold truncate mb-2 text-xl tracking-tight leading-tight">
              {media.caption}
            </h4>
          )}
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <p>
              {formatDistanceToNow(new Date(media.memoryDate || media.uploadedAt), {
                addSuffix: true,
              })}
            </p>
            {media.uploadedByName && (
              <>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <p className="opacity-80 truncate">by {media.uploadedByName}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
