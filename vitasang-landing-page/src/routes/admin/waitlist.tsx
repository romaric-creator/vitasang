import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/admin/waitlist")({
  component: WaitlistAdmin,
});

interface WaitlistEntry {
  email: string;
  source?: string;
  createdAt?: string;
}

const DEFAULT_API_URL = "https://vitasang.onrender.com";
const DEFAULT_KEY = "vitasang-admin-2026";
const PER_PAGE = 20;

function formatDate(d?: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WaitlistAdmin() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [adminKey, setAdminKey] = useState(DEFAULT_KEY);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data state
  const [allData, setAllData] = useState<WaitlistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Stored creds for refresh
  const credsRef = useRef({ apiUrl: "", key: "" });

  async function doLogin() {
    if (!apiUrl || !adminKey) {
      setLoginError("Remplissez tous les champs.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      const base = apiUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/api/waitlist?key=${encodeURIComponent(adminKey)}`);
      if (res.status === 401) throw new Error("Clé invalide");
      if (!res.ok) throw new Error("Erreur serveur " + res.status);
      const json = await res.json();
      credsRef.current = { apiUrl: base, key: adminKey };
      setAllData(json.data || []);
      setIsLoggedIn(true);
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadData() {
    setRefreshing(true);
    try {
      const { apiUrl: base, key } = credsRef.current;
      const res = await fetch(`${base}/api/waitlist?key=${encodeURIComponent(key)}`);
      const json = await res.json();
      setAllData(json.data || []);
      setCurrentPage(1);
    } catch (e: unknown) {
      alert("Erreur: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRefreshing(false);
    }
  }

  // Stats
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const statToday = allData.filter((r) => r.createdAt?.slice(0, 10) === todayStr).length;
  const statWeek = allData.filter((r) => r.createdAt && new Date(r.createdAt) >= weekAgo).length;

  // Filtered & paginated
  const filtered = allData.filter((r) =>
    r.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function exportCSV() {
    const rows = [["#", "Email", "Source", "Date"]];
    filtered.forEach((r, i) =>
      rows.push([
        String(i + 1),
        r.email,
        r.source || "landing_page",
        formatDate(r.createdAt),
      ])
    );
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vitasang-waitlist-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  // Pagination range helper
  function pageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) {
      pages.push(p);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#1a1a2e]">
      {/* Header */}
      <header className="flex items-center justify-between bg-[#9E2016] px-8 py-5 shadow-md">
        <h1 className="text-lg font-bold text-white">🩸 VitaSang — Waitlist Admin</h1>
        <span className="text-sm text-white/80">
          {isLoggedIn ? `Connecté · ${allData.length} inscrits` : "Non connecté"}
        </span>
      </header>

      {/* Login */}
      {!isLoggedIn && (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-lg text-center">
            <h2 className="text-xl font-bold">Accès Admin</h2>
            <p className="mt-2 text-sm text-[#666]">
              Entrez la clé d'administration et l'URL de l'API
            </p>
            <div className="mt-6 space-y-3">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://vitasang.onrender.com"
                className="w-full rounded-xl border border-[#E0E0E0] px-4 py-3 text-sm outline-none transition focus:border-[#9E2016]"
              />
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Clé admin"
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                className="w-full rounded-xl border border-[#E0E0E0] px-4 py-3 text-sm outline-none transition focus:border-[#9E2016]"
              />
              <button
                onClick={doLogin}
                disabled={loginLoading}
                className="w-full rounded-xl bg-[#9E2016] py-3 font-bold text-white transition hover:bg-[#7a1811] disabled:cursor-not-allowed disabled:bg-[#ccc]"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
              {loginError && (
                <p className="text-xs text-[#9E2016]">{loginError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {isLoggedIn && (
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Stats */}
          <div className="mb-7 flex flex-wrap gap-4">
            {[
              { num: allData.length, label: "Emails inscrits" },
              { num: statToday, label: "Aujourd'hui" },
              { num: statWeek, label: "Cette semaine" },
            ].map(({ num, label }) => (
              <div
                key={label}
                className="min-w-[140px] flex-1 rounded-xl bg-white px-7 py-5 text-center shadow-sm"
              >
                <div className="text-4xl font-extrabold text-[#9E2016]">{num}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#888]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold">Liste des inscrits</h2>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="🔍 Rechercher un email..."
                className="w-56 rounded-xl border border-[#E0E0E0] px-4 py-2 text-sm outline-none transition focus:border-[#9E2016]"
              />
              <button
                onClick={exportCSV}
                className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d2d4e]"
              >
                ⬇ Exporter CSV
              </button>
              <button
                onClick={loadData}
                disabled={refreshing}
                className="rounded-lg bg-[#555] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#444] disabled:opacity-60"
              >
                {refreshing ? "..." : "↻ Actualiser"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#F0F0F0] bg-[#FAFAFA]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#888]">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#888]">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#888]">Source</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#888]">Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-[#AAA]">
                      Aucun résultat
                    </td>
                  </tr>
                ) : (
                  slice.map((r, i) => (
                    <tr
                      key={r.email + i}
                      className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#FEF9F9]"
                    >
                      <td className="px-4 py-3 text-xs text-[#AAA]">
                        {(safePage - 1) * PER_PAGE + i + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{r.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            r.source === "app"
                              ? "bg-[#E8F5E9] text-[#2e7d32]"
                              : "bg-[#FCE4E4] text-[#9E2016]"
                          }`}
                        >
                          {r.source || "landing_page"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#555]">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1a1a2e] transition hover:bg-[#F5F5F5] disabled:opacity-40"
              >
                ‹
              </button>
              {pageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-sm text-[#888]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      safePage === p
                        ? "bg-[#9E2016] text-white"
                        : "border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="rounded-lg border border-[#E0E0E0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1a1a2e] transition hover:bg-[#F5F5F5] disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
