"use client";

import Link from "next/link";
import { Vault } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { apiClient } from "@/lib/api-client";
import { Trash2, ChevronRight } from "lucide-react";

interface VaultCardProps {
  vault: Vault;
  onDeleted: (vaultId: string) => void;
}

export function VaultCard({ vault, onDeleted }: VaultCardProps) {
  const handleDelete = async () => {
    try {
      await apiClient.deleteVault(vault.id);
      onDeleted(vault.id);
    } catch (err) {
      console.error("Failed to delete vault:", err);
    }
  };

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex-1">
        <CardTitle className="text-lg">{vault.name}</CardTitle>
        {vault.description && (
          <CardDescription className="line-clamp-2">
            {vault.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-600">
          <p>{vault.members.length} member{vault.members.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/vault/${vault.id}`} className="flex-1">
            <Button variant="default" className="w-full gap-2">
              Open
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Vault</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All content in "{vault.name}" will be permanently deleted.
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
      </CardContent>
    </Card>
  );
}
