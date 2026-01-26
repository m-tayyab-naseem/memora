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

interface MediaCardProps {
  media: MediaItem;
  vaultId: string;
  onDeleted: (mediaId: string) => void;
}

export function MediaCard({ media, vaultId, onDeleted }: MediaCardProps) {
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
    <div className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
      {media.type === "photo" ? (
        <Image
          src={media.url || "/placeholder.svg"}
          alt="Gallery item"
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

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
        <p className="text-xs text-white truncate flex-1">
          {media.type === "photo" ? "Photo" : "Video"}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
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
      </div>
    </div>
  );
}
