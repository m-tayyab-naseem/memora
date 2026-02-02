"use client";

import { useState } from "react";
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
import { Trash2, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MediaCardProps {
  media: MediaItem;
  vaultId: string;
  onDeleted: (mediaId: string) => void;
  onOpen?: () => void;
}

export function MediaCard({ media, vaultId, onDeleted, onOpen }: MediaCardProps) {
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
      className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer"
      onClick={onOpen}
    >
      {media.type === "photo" ? (
        <Image
          src={media.url || "/placeholder.svg"}
          alt={media.caption || "Gallery item"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <>
          <video
            src={media.url}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
        </>
      )}

      {/* Caption overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-between p-3">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-white/90 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
          }}
          disabled={loading}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Trash2 className="h-4 w-4 text-red-600" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Media</AlertDialogTitle>
                <AlertDialogDescription>
                  This media will be permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </Button>

        {/* Info at bottom */}
        <div className="w-full text-white text-xs">
          {media.caption && <p className="font-medium truncate mb-1">{media.caption}</p>}
          <p className="text-slate-200">
            {formatDistanceToNow(new Date(media.memoryDate || media.uploadedAt), {
              addSuffix: true,
            })}
          </p>
          {media.uploadedByName && (
            <p className="text-slate-300">{media.uploadedByName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
