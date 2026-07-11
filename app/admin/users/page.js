"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { LoadingBlock, EmptyState } from "@/components/States";
import Pagination from "@/components/Pagination";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await api.get("/users", { page, limit: 10, role: role || undefined });
      setUsers(data);
      setMeta(meta);
    } finally {
      setLoading(false);
    }
  }, [page, role]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone with an account on Order Management System."
        action={
          <select
            className="input"
            style={{ width: 180 }}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="store_manager">Store manager</option>
            <option value="customer">Customer</option>
          </select>
        }
      />

      {loading ? (
        <LoadingBlock label="Loading users…" />
      ) : !users.length ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="text-slate">{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role.replace("_", " ")}</span>
                  </td>
                  <td className="font-mono text-xs text-slate">{u._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
