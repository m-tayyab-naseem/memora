"use client";

import { useState, useMemo, useEffect } from "react";
import { MediaItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaCard } from "./media-card";
import { MediaLightbox } from "./media-lightbox";
import { Search, Grid2X2, Calendar, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

interface MediaGalleryProps {
  vaultId: string;
  refreshTrigger?: number;
  initialMedia?: MediaItem[];
  onMediaDeleted?: (mediaId: string) => void;
}

type ViewMode = "grid" | "timeline";

const ITEMS_PER_PAGE = 24;

export function MediaGallery({ vaultId, initialMedia = [], onMediaDeleted }: MediaGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [selectedContributor, setSelectedContributor] = useState<string | "all">("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "photo" | "video">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayLimit(ITEMS_PER_PAGE);
  }, [debouncedSearch, selectedContributor, selectedMediaType]);

  const filteredMedia = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return initialMedia.filter((media) => {
      const matchesSearch =
        !debouncedSearch ||
        media.caption?.toLowerCase().includes(searchLower) ||
        media.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );

      const matchesContributor =
        selectedContributor === "all" ||
        media.uploadedBy === selectedContributor;

      const matchesType =
        selectedMediaType === "all" || media.type === selectedMediaType;

      return matchesSearch && matchesContributor && matchesType;
    });
  }, [initialMedia, debouncedSearch, selectedContributor, selectedMediaType]);

  const displayedMedia = useMemo(() => {
    return filteredMedia.slice(0, displayLimit);
  }, [filteredMedia, displayLimit]);

  const groupedByDate = useMemo(() => {
    if (viewMode !== "timeline") return {};

    const grouped: Record<string, MediaItem[]> = {};
    // Only group what we're displaying to keep it snappy
    displayedMedia.forEach((media) => {
      const date = media.memoryDate || media.uploadedAt;
      const year = format(parseISO(date), "yyyy");
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(media);
    });

    return grouped;
  }, [displayedMedia, viewMode]);

  const contributors = useMemo(() => {
    const uniqueMap = new Map();
    initialMedia.forEach(m => {
      if (!uniqueMap.has(m.uploadedBy)) {
        uniqueMap.set(m.uploadedBy, m.uploadedByName || "Unknown");
      }
    });
    return Array.from(uniqueMap.entries()).map(([id, name]) => ({ id, name }));
  }, [initialMedia]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const hasMore = displayLimit < filteredMedia.length;

  return (
    <>
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Media Gallery
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Showing {displayedMedia.length} of {filteredMedia.length} items
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`gap-2 rounded-lg transition-all ${viewMode === "grid" ? "shadow-md" : "text-slate-600"}`}
              >
                <Grid2X2 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className={`gap-2 rounded-lg transition-all ${viewMode === "timeline" ? "shadow-md" : "text-slate-600"}`}
              >
                <Calendar className="h-4 w-4" />
                Timeline
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white ring-offset-background border-slate-200 focus-visible:ring-indigo-500 rounded-xl transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Type</span>
                <div className="flex gap-1.5">
                  {(["all", "photo", "video"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={selectedMediaType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMediaType(type)}
                      className={`capitalize rounded-full px-4 h-8 text-xs font-medium ${selectedMediaType === type ? "bg-indigo-600" : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                    >
                      {type === "all" ? "All" : type + "s"}
                    </Button>
                  ))}
                </div>
              </div>

              {contributors.length > 1 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Contributor</span>
                  <div className="flex gap-1.5 flex-wrap">
                    <Button
                      variant={selectedContributor === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedContributor("all")}
                      className={`rounded-full px-4 h-8 text-xs font-medium ${selectedContributor === "all" ? "bg-indigo-600" : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                    >
                      All
                    </Button>
                    {contributors.map((contributor) => (
                      <Button
                        key={contributor.id}
                        variant={selectedContributor === contributor.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedContributor(contributor.id)}
                        className={`rounded-full px-4 h-8 text-xs font-medium ${selectedContributor === contributor.id ? "bg-indigo-600" : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                      >
                        {contributor.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {displayedMedia.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">No media found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedMedia.map((media, index) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  vaultId={vaultId}
                  onDeleted={(id) => onMediaDeleted?.(id)}
                  onOpen={() => handleOpenLightbox(index)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedByDate)
                .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                .map(([year, items]) => (
                  <div key={year} className="relative">
                    <div className="flex items-center gap-4 mb-6 sticky top-0 py-3 bg-white/95 backdrop-blur-sm z-10 -mx-4 px-4 sm:mx-0 sm:px-0">
                      <h3 className="text-xl font-bold text-slate-900">{year}</h3>
                      <div className="h-px flex-1 bg-slate-100" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{items.length} Memories</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {items.map((media) => {
                        const absoluteIndex = displayedMedia.indexOf(media);
                        return (
                          <MediaCard
                            key={media.id}
                            media={media}
                            vaultId={vaultId}
                            onDeleted={(id) => onMediaDeleted?.(id)}
                            onOpen={() => handleOpenLightbox(absoluteIndex)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-12 flex justify-center pb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayLimit(prev => prev + ITEMS_PER_PAGE)}
                className="rounded-full px-10 h-12 font-semibold border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <MediaLightbox
        media={displayedMedia}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
