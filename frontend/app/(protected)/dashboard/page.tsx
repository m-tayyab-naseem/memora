"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Vault } from "@/lib/types";
import { VaultCard } from "@/components/vault/vault-card";
import { CreateVaultDialog } from "@/components/vault/create-vault-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const data = await apiClient.getVaults();
        setVaults(data);

      } catch (err) {
        setError("Failed to load vaults");
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, []);

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
            <div
              key={i}
              className="h-48 bg-muted rounded-lg animate-pulse"
            />
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
