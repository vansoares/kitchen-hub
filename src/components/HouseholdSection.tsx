"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { HouseholdDTO } from "@/types/household";

export function HouseholdSection() {
  const [household, setHousehold] = useState<HouseholdDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    api
      .getHousehold()
      .then((h) => {
        setHousehold(h);
        setNameDraft(h.name);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function saveName() {
    const name = nameDraft.trim();
    if (!name || !household || name === household.name) {
      setEditingName(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setHousehold(await api.renameHousehold(name));
      setEditingName(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setHousehold(await api.addHouseholdMember(newEmail.trim()));
      setNewEmail("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(email: string) {
    if (!household) return;
    const isSelf = email === household.you;
    if (isSelf && !confirm("Sair da despensa compartilhada? Voce passa a ter uma despensa individual.")) return;
    setBusy(true);
    setError(null);
    try {
      setHousehold(await api.removeHouseholdMember(email));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!household) {
    return (
      <section>
        <h3 className="mb-2 text-sm font-bold text-brand-700 dark:text-brand-200">🏠 Despensa compartilhada</h3>
        <p className="text-sm text-brand-700/70 dark:text-brand-200/70">
          {error ?? "Carregando..."}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-brand-700 dark:text-brand-200">🏠 Despensa compartilhada</h3>
      <p className="text-xs text-brand-700/70 dark:text-brand-200/70">
        Quem estiver aqui compartilha os mesmos itens, receitas e compras - ideal pra quem mora junto.
      </p>

      {editingName ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="flex-1 rounded-xl bg-brand-500/5 px-3 py-2 text-sm font-medium text-brand-700 outline-none dark:bg-white/5 dark:text-brand-100"
          />
          <button
            onClick={saveName}
            disabled={busy}
            className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditingName(true)}
          className="flex items-center justify-between rounded-xl bg-brand-500/5 px-3 py-2.5 text-left dark:bg-white/5"
        >
          <span className="text-sm font-bold text-brand-700 dark:text-brand-100">{household.name}</span>
          <span className="text-xs text-brand-700/60 dark:text-brand-200/60">renomear</span>
        </button>
      )}

      <ul className="flex flex-col gap-1.5">
        {household.members.map((email) => (
          <li
            key={email}
            className="flex items-center justify-between gap-2 rounded-xl bg-brand-500/5 px-3 py-2 dark:bg-white/5"
          >
            <span className="truncate text-sm text-brand-700 dark:text-brand-200">
              {email}
              {email === household.you && <span className="ml-1 font-bold">(voce)</span>}
            </span>
            <button
              onClick={() => removeMember(email)}
              disabled={busy}
              aria-label={email === household.you ? "Sair da despensa" : `Remover ${email}`}
              className="shrink-0 text-xs font-bold text-red-500 disabled:opacity-50"
            >
              {email === household.you ? "sair" : "remover"}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addMember} className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email@exemplo.com"
          className="flex-1 rounded-xl bg-brand-500/5 px-3 py-2 text-sm text-brand-700 outline-none placeholder:text-brand-700/40 dark:bg-white/5 dark:text-brand-100 dark:placeholder:text-brand-200/40"
        />
        <button
          type="submit"
          disabled={busy || !newEmail.trim()}
          className="shrink-0 rounded-xl bg-brand-500 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </section>
  );
}
