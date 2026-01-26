"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { MediaItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaCard } from "./media-card";

interface MediaGalleryProps {
  vaultId: string;
  refreshTrigger?: number;
}

export function MediaGallery({ vaultId, refreshTrigger }: MediaGalleryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getMediaItems(vaultId);
        setMediaItems(data);
      } catch (err) {
        setError("Failed to load media");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [vaultId, refreshTrigger]);

  const handleMediaDeleted = (mediaId: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>
          {mediaItems.length} item{mediaItems.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-slate-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No media yet. Upload your first file!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaItems.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                vaultId={vaultId}
                onDeleted={handleMediaDeleted}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
