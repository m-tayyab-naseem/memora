"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Menu, Home, Settings, Lock } from "lucide-react";
import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { compactMode } = useSettings();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 mt-4">
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
  );

  return (
    <header className={cn(
      "border-b border-border bg-background shadow-sm transition-all duration-300",
      compactMode ? "px-6 py-2" : "px-6 py-4"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6">
                <SheetHeader className="text-left p-0 mb-8">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Memora</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <NavLinks />
              </SheetContent>
            </Sheet>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Memora</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Preserve your memories together</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                <User className="h-4 w-4 text-violet-600" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-xs text-slate-500">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="gap-2">
              <User className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
