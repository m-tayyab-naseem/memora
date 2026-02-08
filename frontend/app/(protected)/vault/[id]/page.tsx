"use client";

import { useEffect, useState, use, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Vault, MediaItem, VaultMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Sparkles, Search } from "lucide-react";
import { MediaGallery } from "@/components/media/media-gallery";
import { MediaUpload } from "@/components/media/media-upload";
import { VaultMembers } from "@/components/vault/vault-members";
import { VaultSettings } from "@/components/vault/vault-settings";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id: vaultId } = use(params);
  const [vault, setVault] = useState<Vault | null>(null);
  const [members, setMembers] = useState<VaultMember[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVaultData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [vaultData, membersData, mediaData] = await Promise.all([
        apiClient.getVault(vaultId),
        apiClient.getVaultMembers(vaultId),
        apiClient.getMediaItems(vaultId),
      ]);
      setVault(vaultData);
      setMembers(membersData);
      setMedia(mediaData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load vault details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [vaultId, toast]);

  const fetchMedia = useCallback(async () => {
    try {
      const mediaData = await apiClient.getMediaItems(vaultId);
      setMedia(mediaData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh media",
        variant: "destructive",
      });
    }
  }, [vaultId, toast]);

  const handleMediaDeleted = useCallback((mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
    toast({
      title: "Media Deleted",
      description: "The media item has been removed from the vault.",
    });
  }, [toast]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  const vaultWithMembers = useMemo(() => {
    if (!vault) return null;
    return { ...vault, members };
  }, [vault, members]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <Sparkles className="h-6 w-6 text-violet-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading your vault memories...</p>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-muted p-6 rounded-full mb-6">
          <Search className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Vault not found</h2>
        <p className="text-muted-foreground mt-2 max-w-xs">The vault you're looking for doesn't exist or you don't have access.</p>
        <Button
          variant="default"
          onClick={() => router.push("/dashboard")}
          className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-full"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const memberCount = vault.memberCount || members.length;

  return (
    <div className="max-w-8xl mx-auto p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button
        variant="ghost"
        className="gap-2 mb-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all group"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Vaults
      </Button>

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-bold uppercase tracking-wider">
            Secure Vault
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            {vault.name}
          </h1>
          {vault.description && (
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {vault.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((m, i) => (
                <div key={m.id} className={`h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground shadow-sm z-[${3 - i}]`}>
                  {m.name.substring(0, 2)}
                </div>
              ))}
              {members.length > 3 && (
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm">
                  +{members.length - 3}
                </div>
              )}
            </div>
            <p>
              <span className="text-foreground font-bold">{memberCount}</span> member{memberCount !== 1 ? "s" : ""} sharing memories
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {vaultWithMembers && <VaultSettings vault={vaultWithMembers} onUpdate={fetchVaultData} />}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-10 order-first xl:order-last">
          <div className="sticky top-8 space-y-10">
            {vault.userRole !== "viewer" && (
              <MediaUpload vaultId={vault.id} onUploadSuccess={fetchMedia} />
            )}
            <VaultMembers members={members} />
          </div>
        </div>
        <div className="xl:col-span-8 space-y-12">
          <MediaGallery
            vaultId={vault.id}
            initialMedia={media}
            members={members}
            userRole={vault.userRole}
            onMediaDeleted={handleMediaDeleted}
          />
        </div>
      </div>
    </div>
  );
}
