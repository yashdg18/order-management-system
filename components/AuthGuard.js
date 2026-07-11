"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingBlock } from "./States";

export default function AuthGuard({ allow, children }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || !allow.includes(user.role)) {
      router.replace("/login");
      return;
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  if (!checked) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  return children;
}
