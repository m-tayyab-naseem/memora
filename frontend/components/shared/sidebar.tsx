"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/settings-context";

export function Sidebar() {
  const pathname = usePathname();
  const { compactMode } = useSettings();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className={cn(
      "w-64 border-r border-border bg-background shadow-sm transition-all duration-300",
      compactMode ? "px-3 py-4" : "px-4 py-6"
    )}>
      <div className={cn("space-y-6", !compactMode && "space-y-8")}>
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Memora</p>
              <p className="text-xs text-muted-foreground">Memory Vaults</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive("/dashboard")
                  ? "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </div>
          </Link>

          <Link href="/settings">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive("/settings")
                  ? "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </div>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
