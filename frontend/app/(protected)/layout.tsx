"use client";

import React from "react"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { UiProvider, useUi } from "@/context/ui-context";

function ProtectedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isImmersive } = useUi();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {!isImmersive && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isImmersive && <Header />}
        <main className="flex-1 overflow-auto focus:outline-none">{children}</main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
      </div>
    );
  }

  return (
    <UiProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </UiProvider>
  );
}
