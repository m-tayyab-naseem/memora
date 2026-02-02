"use client";

import { useState } from "react";
import { Vault, VaultMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Settings, Trash2, Check } from "lucide-react";
import { getRoleColor, getRoleDescription } from "@/lib/role-utils";

interface VaultSettingsProps {
    vault: Vault;
}

export function VaultSettings({ vault }: VaultSettingsProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${vault.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const roleColors: Record<string, string> = {
        owner: "bg-violet-100 text-violet-700",
        custodian: "bg-amber-100 text-amber-700",
        editor: "bg-blue-100 text-blue-700",
        viewer: "bg-slate-100 text-slate-700",
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    Vault Settings
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto max-h-screen p-10 sm:max-w-md">
                <SheetHeader className="p-0 mb-6">
                    <SheetTitle className="text-2xl">Vault Settings</SheetTitle>
                    <SheetDescription className="text-base">
                        Manage your vault settings and member access
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Vault Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Vault Information</h3>
                        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                            <div>
                                <p className="text-xs font-medium text-slate-600">Name</p>
                                <p className="text-sm font-semibold text-slate-900">{vault.name}</p>
                            </div>
                            {vault.description && (
                                <div>
                                    <p className="text-xs font-medium text-slate-600">Description</p>
                                    <p className="text-sm text-slate-700">{vault.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-slate-600">Vault ID</p>
                                <p className="text-xs font-mono text-slate-500">{vault.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invite Link */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Invite Members</h3>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-600">
                                Share this link with family members to invite them to this vault
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    className="text-xs"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 shrink-0 bg-transparent"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-600" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Role Explanations */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Member Roles</h3>
                        <div className="space-y-2">
                            {[
                                { role: "owner", desc: "Full control over vault, members, and media" },
                                { role: "custodian", desc: "Can approve changes and manage members" },
                                { role: "editor", desc: "Can add and delete media" },
                                { role: "viewer", desc: "Can only view media" },
                            ].map(({ role, desc }) => (
                                <div key={role} className="border border-slate-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded capitalize ${roleColors[role]}`}
                                        >
                                            {role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Members */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Members ({vault.members?.length || 0})</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {vault.members?.map((member: VaultMember) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.email}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded capitalize ${roleColors[member.role]}`}
                                    >
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-3 border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-red-600">Danger Zone</h3>
                        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                            <Button
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Vault
                            </Button>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Vault?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete "{vault.name}" and all its media. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-3 justify-end">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600">
                                        Delete Vault
                                    </AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
