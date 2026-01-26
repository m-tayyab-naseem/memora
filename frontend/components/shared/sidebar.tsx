"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white px-4 py-6 shadow-sm">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Memora</p>
              <p className="text-xs text-slate-500">Memory Vaults</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive("/dashboard")
                  ? "bg-violet-50 text-violet-600"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </div>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
