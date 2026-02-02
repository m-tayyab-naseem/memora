"use client";

import { useState, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { MediaItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaCard } from "./media-card";
import { MediaLightbox } from "./media-lightbox";
import { Search, Grid2X2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

interface MediaGalleryProps {
  vaultId: string;
  refreshTrigger?: number;
  initialMedia?: MediaItem[];
}

type ViewMode = "grid" | "timeline";

export function MediaGallery({ vaultId, initialMedia }: MediaGalleryProps) {
  const [mediaItems] = useState<MediaItem[]>(initialMedia || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContributor, setSelectedContributor] = useState<string | "all">("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "photo" | "video">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((media) => {
      const matchesSearch =
        !searchQuery ||
        media.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        media.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesContributor =
        selectedContributor === "all" ||
        media.uploadedBy === selectedContributor;

      const matchesType =
        selectedMediaType === "all" || media.type === selectedMediaType;

      return matchesSearch && matchesContributor && matchesType;
    });
  }, [mediaItems, searchQuery, selectedContributor, selectedMediaType]);

  const groupedByDate = useMemo(() => {
    if (viewMode !== "timeline") return {};

    const grouped: Record<string, MediaItem[]> = {};
    filteredMedia.forEach((media) => {
      const date = media.memoryDate || media.uploadedAt;
      const year = format(parseISO(date), "yyyy");
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(media);
    });

    return grouped;
  }, [filteredMedia, viewMode]);

  const contributors = useMemo(() => {
    return Array.from(new Set(mediaItems.map((m) => m.uploadedBy))).map((id) => {
      const media = mediaItems.find((m) => m.uploadedBy === id);
      return { id, name: media?.uploadedByName || "Unknown" };
    });
  }, [mediaItems]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>
                {filteredMedia.length} of {mediaItems.length} item
                {mediaItems.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid2X2 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Timeline
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by caption or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-600">Type:</span>
                <Button
                  variant={selectedMediaType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMediaType("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedMediaType === "photo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMediaType("photo")}
                >
                  Photos
                </Button>
                <Button
                  variant={selectedMediaType === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMediaType("video")}
                >
                  Videos
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-600">Contributor:</span>
                <Button
                  variant={selectedContributor === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedContributor("all")}
                >
                  All
                </Button>
                {contributors.map((contributor) => (
                  <Button
                    key={contributor.id}
                    variant={selectedContributor === contributor.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedContributor(contributor.id)}
                  >
                    {contributor.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No media found. Try adjusting your filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedia.map((media, index) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  vaultId={vaultId}
                  onDeleted={() => { }}
                  onOpen={() => handleOpenLightbox(index)}
                />
              ))}
            </div>
          ) : (
            /* Timeline View */
            <div className="space-y-8">
              {Object.entries(groupedByDate)
                .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                .map(([year, items]) => (
                  <div key={year}>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 sticky top-0 bg-white py-2">
                      {year} ({items.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {items.map((media, index) => {
                        const absoluteIndex = filteredMedia.indexOf(media);
                        return (
                          <MediaCard
                            key={media.id}
                            media={media}
                            vaultId={vaultId}
                            onDeleted={() => { }}
                            onOpen={() => handleOpenLightbox(absoluteIndex)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MediaLightbox
        media={filteredMedia}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
