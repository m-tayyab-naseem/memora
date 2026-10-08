"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Vault } from "@/lib/types";
import { VaultCard } from "@/components/vault/vault-card";
import { CreateVaultDialog } from "@/components/vault/create-vault-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

// Re-fetch vaults on an interval and whenever the tab regains focus, so
// changes made elsewhere (another tab, another member) show up without
// a manual reload.
const AUTO_REFRESH_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchVaults = useCallback(async (isInitialLoad = false) => {
    try {
      const data = await apiClient.getVaults();
      setVaults(data);
      setError(null);
    } catch (err) {
      setError("Failed to load vaults");
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaults(true);

    const intervalId = setInterval(() => fetchVaults(false), AUTO_REFRESH_INTERVAL_MS);
    const onFocus = () => fetchVaults(false);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchVaults]);

  const handleVaultCreated = (newVault: Vault) => {
    // Explicitly set userRole as owner for newly created vaults so the delete button shows immediately
    const vaultWithRole = { ...newVault, userRole: "owner" as const };
    setVaults((prev) => [vaultWithRole, ...prev]);
    setShowCreateDialog(false);
  };

  const handleVaultDeleted = (vaultId: string) => {
    setVaults((prev) => prev.filter((v) => v.id !== vaultId));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-foreground">My Vaults</h2>
          <CreateVaultDialog
            isOpen={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onVaultCreated={handleVaultCreated}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Vault
              </Button>
            }
          />
        </div>
        <p className="text-muted-foreground">
          Create and manage your memory vaults securely
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : vaults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No vaults yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onDeleted={handleVaultDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
