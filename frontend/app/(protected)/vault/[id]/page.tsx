"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Vault } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { MediaGallery } from "@/components/media/media-gallery";
import { MediaUpload } from "@/components/media/media-upload";
import { VaultMembers } from "@/components/vault/vault-members";

export default function VaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.id as string;

  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const data = await apiClient.getVault(vaultId);
        setVault(data);
      } catch (err) {
        setError("Failed to load vault");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [vaultId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
      </div>
    );
  }

  if (error || !vault) {
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
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error || "Vault not found"}
        </div>
      </div>
    );
  }

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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{vault.name}</h1>
        {vault.description && (
          <p className="text-slate-600">{vault.description}</p>
        )}
        <div className="mt-4 text-sm text-slate-600">
          <p>{vault.members.length} member{vault.members.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MediaUpload vaultId={vaultId} />
          <MediaGallery vaultId={vaultId} />
        </div>
        <div>
          <VaultMembers members={vault.members} />
        </div>
      </div>
    </div>
  );
}
