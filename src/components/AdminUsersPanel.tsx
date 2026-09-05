"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { FEATURES } from "@/lib/features";
import type { AdminUserDTO } from "@/types/feature";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar usuarios"));
  }, []);

  async function toggleFeature(email: string, feature: string, enabled: boolean) {
    const key = `${email}:${feature}`;
    setBusyKey(key);
    setError(null);
    try {
      await api.setUserFeature(email, feature, enabled);
      setUsers((prev) =>
        prev
          ? prev.map((u) =>
              u.email === email
                ? { ...u, features: enabled ? [...u.features, feature] : u.features.filter((f) => f !== feature) }
                : u
            )
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar feature");
    } finally {
      setBusyKey(null);
    }
  }

  if (error && !users) {
    return <p className="text-sm font-medium text-red-500">{error}</p>;
  }

  if (!users) {
    return <p className="text-brand-400">Carregando...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-brand-900/60 dark:text-cream/60">
        {users.length} {users.length === 1 ? "pessoa" : "pessoas"} com conta criada.
      </p>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div key={user.email} className="rounded-2xl bg-white p-4 dark:bg-brand-800">
            <div className="mb-3 flex items-center gap-3">
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? user.email}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 shrink-0 rounded-full"
                />
              )}
              <div className="min-w-0">
                <div className="truncate font-bold text-brand-800 dark:text-cream">{user.name ?? user.email}</div>
                <div className="truncate text-xs text-brand-900/50 dark:text-cream/50">{user.email}</div>
                <div className="text-xs text-brand-900/40 dark:text-cream/40">
                  primeiro login em {formatDate(user.createdAt)} · ultimo em {formatDate(user.lastLoginAt)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FEATURES.map((feature) => {
                const enabled = user.features.includes(feature.key);
                const key = `${user.email}:${feature.key}`;
                return (
                  <label
                    key={feature.key}
                    title={feature.description}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      enabled
                        ? "bg-brand-500 text-white"
                        : "bg-brand-500/10 text-brand-700 dark:bg-white/10 dark:text-brand-200"
                    } ${busyKey === key ? "opacity-50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={busyKey === key}
                      onChange={(e) => toggleFeature(user.email, feature.key, e.target.checked)}
                      className="h-4 w-4 accent-brand-500"
                    />
                    {feature.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
