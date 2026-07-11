"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/DashboardShell";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard allow={["admin"]}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
