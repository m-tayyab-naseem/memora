"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Vault, VaultMember, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Copy, Settings, Trash2, Check, UserPlus, UserMinus, Edit2, Save, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface VaultSettingsProps {
    vault: Vault;
    onUpdate?: () => void;
}

export function VaultSettings({ vault, onUpdate }: VaultSettingsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(vault.name);
    const [editDescription, setEditDescription] = useState(vault.description || "");
    const [isSaving, setIsSaving] = useState(false);

    // Member management state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
    const [isInviting, setIsInviting] = useState(false);

    const isOwner = vault.userRole === "owner";

    const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${vault.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpdateVault = async () => {
        if (!editName.trim()) return;
        try {
            setIsSaving(true);
            await apiClient.updateVault(vault.id, editName, editDescription);
            setIsEditing(false);
            if (onUpdate) onUpdate();
            toast({ title: "Vault Updated", description: "Changes saved successfully." });
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteVault = async () => {
        try {
            setIsDeleting(true);
            await apiClient.deleteVault(vault.id);
            toast({ title: "Vault Deleted", description: "The vault has been permanently removed." });

            // Wait a moment for the user to see the toast before redirecting
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddMember = async () => {
        if (!inviteEmail.trim()) return;
        try {
            setIsInviting(true);
            await apiClient.addVaultMember(vault.id, inviteEmail, inviteRole);
            setInviteEmail("");
            if (onUpdate) onUpdate();
            toast({ title: "Member Added", description: `${inviteEmail} is now a member.` });
        } catch (error: any) {
            toast({ title: "Failed to Add Member", description: error.message, variant: "destructive" });
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        try {
            await apiClient.updateVaultMemberRole(vault.id, userId, newRole);
            if (onUpdate) onUpdate();
            toast({ title: "Role Updated", description: "Member role has been changed." });
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        }
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            await apiClient.removeVaultMember(vault.id, userId);
            if (onUpdate) onUpdate();
            toast({ title: "Member Removed", description: "Member has been removed from the vault." });
        } catch (error: any) {
            toast({ title: "Removal Failed", description: error.message, variant: "destructive" });
        }
    };

    const roleColors: Record<string, string> = {
        owner: "bg-violet-100 text-violet-700",
        editor: "bg-blue-100 text-blue-700",
        viewer: "bg-muted text-muted-foreground",
    };

    const availableRoles: UserRole[] = ["editor", "viewer"];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                    Vault Settings
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto max-h-screen p-10 sm:max-w-xl">
                <SheetHeader className="p-0 mb-6">
                    <SheetTitle className="text-2xl">Vault Settings</SheetTitle>
                    <SheetDescription className="text-base">
                        Manage your vault settings and member access
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Vault Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Vault Information</h3>
                            {isOwner && !isEditing && (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 gap-2">
                                    <Edit2 className="h-3.5 w-3.5" /> Edit
                                </Button>
                            )}
                        </div>
                        <div className="rounded-lg border border-border p-4 space-y-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="My Memories"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-600">Description</label>
                                        <Textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="A place for my special moments"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleUpdateVault} disabled={isSaving} className="gap-2">
                                            {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => {
                                            setIsEditing(false);
                                            setEditName(vault.name);
                                            setEditDescription(vault.description || "");
                                        }} disabled={isSaving}>
                                            <X className="h-4 w-4" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                                        <p className="text-sm font-semibold text-foreground">{vault.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                                        <p className="text-sm text-foreground/80">{vault.description || "No description provided."}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Invite Link - Only for owners and potentially editors? Keeping as is for now */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Share Vault</h3>
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Use the link below or add members directly via email to share this vault.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    className="text-xs bg-muted"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 shrink-0"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Direct Member Addition - Owner Only */}
                    {isOwner && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground">Add Member</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-7">
                                    <Input
                                        placeholder="user@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="sm:col-span-2">
                                    <Button
                                        onClick={handleAddMember}
                                        disabled={isInviting || !inviteEmail}
                                        className="w-full h-9 bg-violet-600 hover:bg-violet-700"
                                        size="sm"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current Members */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Members ({vault.members?.length || 0})</h3>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {vault.members?.map((member: VaultMember) => {
                                const isSelf = member.email === (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').email) : '');
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30"
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOwner && member.role !== 'owner' ? (
                                                <>
                                                    <Select value={member.role} onValueChange={(v) => handleUpdateRole(member.id, v as UserRole)}>
                                                        <SelectTrigger className={`h-8 w-[100px] text-xs font-semibold ${roleColors[member.role]}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="editor">Editor</SelectItem>
                                                            <SelectItem value="viewer">Viewer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <span
                                                    className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${roleColors[member.role]}`}
                                                >
                                                    {member.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Role Explanations */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Role Permissions</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { role: "owner", desc: "Full control over vault settings, members, and all media." },
                                { role: "editor", desc: "Can upload new media and delete existing media." },
                                { role: "viewer", desc: "Can browse and view all media in the vault." },
                            ].map(({ role, desc }) => (
                                <div key={role} className="flex gap-3 p-3 bg-muted rounded-lg">
                                    <span className={`h-fit px-2 py-0.5 text-[10px] font-bold rounded uppercase shrink-0 ${roleColors[role]}`}>
                                        {role}
                                    </span>
                                    <p className="text-xs text-muted-foreground leading-normal">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    {isOwner && (
                        <div className="space-y-3 border-t border-border pt-6">
                            <h3 className="font-semibold text-red-600">Danger Zone</h3>
                            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                                <Button
                                    variant="destructive"
                                    className="w-full gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 border-red-100 dark:border-red-900/20 hover:bg-red-600 hover:text-white transition-all shadow-none"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Vault Permanently
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Vault?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete "{vault.name}" and all its media. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex gap-3 justify-end mt-4">
                                        <AlertDialogCancel className="rounded-full" disabled={isDeleting}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700 rounded-full"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteVault();
                                            }}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete Vault"}
                                        </AlertDialogAction>
                                    </div>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
