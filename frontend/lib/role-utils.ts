import { UserRole } from "@/lib/types";

export function getRoleColor(role: UserRole): string {
    switch (role) {
        case "owner":
            return "bg-violet-100 text-violet-700";
        case "custodian":
            return "bg-amber-100 text-amber-700";
        case "viewer":
            return "bg-slate-100 text-slate-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

export function getRoleDescription(role: UserRole): string {
    switch (role) {
        case "owner":
            return "Full control over vault, members, and media";
        case "custodian":
            return "Can approve changes and manage members";
        case "viewer":
            return "Can only view media";
        default:
            return "Unknown role";
    }
}
