"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Vault, MediaItem, VaultMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const fetchVaultData = async () => {
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
    };

    fetchVaultData();
  }, [vaultId, toast]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="p-8 text-center text-slate-700">
        <h2 className="text-xl font-semibold">Vault not found</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="mt-4 bg-transparent border-slate-200"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const memberCount = vault.memberCount || members.length;

  return (
    <div className="p-8">
      <Button
        variant="outline"
        className="gap-2 mb-6 bg-transparent"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{vault.name}</h1>
          {vault.description && (
            <p className="text-slate-600">{vault.description}</p>
          )}
          <div className="mt-4 text-sm text-slate-600">
            <p>{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <VaultSettings vault={{ ...vault, members }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MediaUpload vaultId={vault.id} />
          <MediaGallery vaultId={vault.id} initialMedia={media} />
        </div>
        <div>
          <VaultMembers members={members} />
        </div>
      </div>
    </div>
  );
}
