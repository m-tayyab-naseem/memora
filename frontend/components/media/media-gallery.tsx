"use client";

import { useState, useMemo } from "react";
import { parseISO, format } from "date-fns";
import {
  Grid2X2,
  Calendar,
  Search,
  Filter,
  ImageIcon,
  Play,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { MediaCard } from "./media-card";
import { MediaLightbox } from "./media-lightbox";
import { MediaItem, VaultMember, UserRole } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaGalleryProps {
  vaultId: string;
  initialMedia: MediaItem[];
  members: VaultMember[];
  userRole?: UserRole;
  onMediaDeleted?: (mediaId: string) => void;
}

const ITEMS_PER_PAGE = 36;

export function MediaGallery({
  vaultId,
  initialMedia,
  members,
  userRole,
  onMediaDeleted,
}: MediaGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "photo" | "video">("all");
  const [selectedEditor, setSelectedEditor] = useState("all");
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredMedia = useMemo(() => {
    return initialMedia.filter((media) => {
      const matchesSearch =
        debouncedSearch === "" ||
        media.caption?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        media.uploadedByName?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesEditor =
        selectedEditor === "all" ||
        media.uploadedBy === selectedEditor;

      const matchesType =
        selectedMediaType === "all" || media.type === selectedMediaType;

      return matchesSearch && matchesEditor && matchesType;
    });
  }, [initialMedia, debouncedSearch, selectedEditor, selectedMediaType]);

  const displayedMedia = useMemo(() => {
    return filteredMedia.slice(0, displayLimit);
  }, [filteredMedia, displayLimit]);

  // Google Photos style grouping
  const mediaGroups = useMemo(() => {
    const groups: Record<string, Record<string, MediaItem[]>> = {};

    displayedMedia.forEach((media) => {
      const date = parseISO(media.memoryDate || media.uploadedAt);
      const monthYear = format(date, "MMMM yyyy");
      const fullDate = format(date, "EEE, MMM d, yyyy");

      if (!groups[monthYear]) groups[monthYear] = {};
      if (!groups[monthYear][fullDate]) groups[monthYear][fullDate] = [];

      groups[monthYear][fullDate].push(media);
    });

    return groups;
  }, [displayedMedia]);

  const memberFilterList = useMemo(() => {
    return members.map(m => ({ id: m.id, name: m.name }));
  }, [members]);

  const handleOpenLightbox = (mediaId: string) => {
    const index = displayedMedia.findIndex(m => m.id === mediaId);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const hasMore = displayLimit < filteredMedia.length;

  return (
    <>
      <div className="space-y-12 pb-20 max-w-[1600px] mx-auto">
        {/* Gallery Header & Controls */}
        <div className="flex flex-col gap-8 px-4 sm:px-0">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Memories</h1>

            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-xl px-4 h-9 text-xs font-semibold transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className={`rounded-xl px-4 h-9 text-xs font-semibold transition-all ${viewMode === "timeline" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search your memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-slate-50 border-none ring-offset-background focus-visible:ring-indigo-500/30 rounded-2xl transition-all text-lg shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 px-6 rounded-2xl gap-3 border-slate-200 text-slate-600 bg-white shadow-sm font-medium">
                    <Filter className="h-4 w-4" />
                    {selectedMediaType === "all" ? "All Media" : selectedMediaType === "photo" ? "Photos" : "Videos"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => setSelectedMediaType("all")}>All Media</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedMediaType("photo")}>Photos Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedMediaType("video")}>Videos Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 px-6 rounded-2xl gap-3 border-slate-200 text-slate-600 bg-white shadow-sm font-medium">
                    {selectedEditor === "all" ? "Everyone" : memberFilterList.find(c => c.id === selectedEditor)?.name || "Everyone"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem onClick={() => setSelectedEditor("all")}>All Members</DropdownMenuItem>
                  {memberFilterList.map((c) => (
                    <DropdownMenuItem key={c.id} onClick={() => setSelectedEditor(c.id)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Masonry-Style Content Areas */}
        <div className="space-y-16 px-4 sm:px-0">
          {filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No memories found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View: Continuous stream of squares */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 md:gap-2">
              {displayedMedia.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  vaultId={vaultId}
                  userRole={userRole}
                  variant="square"
                  onDeleted={(id) => onMediaDeleted?.(id)}
                  onOpen={() => handleOpenLightbox(media.id)}
                />
              ))}
            </div>
          ) : (
            /* Timeline View: Grouped by month and day */
            Object.entries(mediaGroups).map(([monthYear, dayGroups]) => (
              <div key={monthYear} className="space-y-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight pl-2">
                  {monthYear}
                </h2>

                <div className="space-y-12">
                  {Object.entries(dayGroups).map(([fullDate, items]) => (
                    <div key={fullDate} className="space-y-4">
                      <div className="flex items-center gap-4 px-2">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{fullDate}</span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>

                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {items.map((media) => (
                          <MediaCard
                            key={media.id}
                            media={media}
                            vaultId={vaultId}
                            userRole={userRole}
                            variant="justified"
                            className="rounded-md md:rounded-lg shadow-sm"
                            style={{ height: '180px' }} // Compact row height
                            onDeleted={(id) => onMediaDeleted?.(id)}
                            onOpen={() => handleOpenLightbox(media.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="pt-16 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDisplayLimit(prev => prev + ITEMS_PER_PAGE)}
              className="rounded-2xl px-16 h-16 text-lg font-bold border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-95"
            >
              Discover more
            </Button>
          </div>
        )}
      </div>

      <MediaLightbox
        media={displayedMedia}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
