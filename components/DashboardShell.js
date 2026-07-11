"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = {
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "All Orders" },
    { href: "/admin/stores", label: "Stores" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/analytics", label: "Analytics" },
  ],
  store_manager: [
    { href: "/store", label: "Overview" },
    { href: "/store/orders", label: "Orders" },
    { href: "/store/products", label: "Products" },
  ],
  customer: [
    { href: "/customer", label: "Browse Stores" },
    { href: "/customer/orders", label: "My Orders" },
  ],
};

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const items = NAV[user.role] || [];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">OMS</div>
          <span className="brand-name">Order Management System</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role.replace("_", " ")}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-outline btn-block btn-sm">
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-content-inner">{children}</div>
      </main>
    </div>
  );
}
