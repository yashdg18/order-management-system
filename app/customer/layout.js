"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/DashboardShell";

export default function CustomerLayout({ children }) {
  return (
    <AuthGuard allow={["customer"]}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
