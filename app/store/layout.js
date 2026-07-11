"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/DashboardShell";

export default function StoreLayout({ children }) {
  return (
    <AuthGuard allow={["store_manager"]}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
