import { UserRole } from "@/lib/types";

export function getRoleColor(role: UserRole): string {
    switch (role) {
        case "owner":
            return "bg-violet-100 text-violet-700";
        case "editor":
            return "bg-blue-100 text-blue-700";
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
        case "editor":
            return "Can add and delete media";
        case "viewer":
            return "Can only view media";
        default:
            return "Unknown role";
    }
}
