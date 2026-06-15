/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ChevronDown,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type AdminUser = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: "super_admin" | "admin";
  is_active: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin" as AdminUser["role"],
    is_active: true,
  });

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await apiFetch("/admin/users", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal mengambil data pengguna.");
      setUsers(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateUser(user: AdminUser, changes: Partial<AdminUser>) {
    try {
      setUpdating(user.id);
      setError("");
      const next = { ...user, ...changes };
      const response = await apiFetch(`/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: next.role,
          is_active: next.is_active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal memperbarui akses.");
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, ...data.data } : item)),
      );
      toast.success(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setUpdating(null);
    }
  }

  async function createAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await apiFetch("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat akun admin.");
      }

      setUsers((current) => [data.data, ...current]);
      setForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "admin",
        is_active: true,
      });
      setCreateDialogOpen(false);
      toast.success(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setCreating(false);
    }
  }

  function closeCreateDialog() {
    if (creating) return;
    setCreateDialogOpen(false);
    setError("");
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "admin",
      is_active: true,
    });
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">Access control</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Pengguna & Role
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Buat dan atur akun khusus pengelola dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
              <ShieldCheck size={17} />
              Role protection aktif
            </div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setCreateDialogOpen(true);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Plus size={18} />
              Buat Akun Admin
            </button>
          </div>
        </div>

        {error && !createDialogOpen ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Pengguna</th>
                  <th className="px-5 py-4">Kontak</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf0fb] font-bold text-[#183a78]">
                          {user.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400">
                            Bergabung {new Date(user.created_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-slate-400">Login admin via email</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative w-40">
                        <select
                          value={user.role}
                          disabled={updating === user.id}
                          onChange={(event) =>
                            updateUser(user, {
                              role: event.target.value as AdminUser["role"],
                            })
                          }
                          className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#315b9f] focus:ring-2 focus:ring-[#315b9f]/10 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={updating === user.id}
                        onClick={() => updateUser(user, { is_active: !user.is_active })}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {user.is_active ? <UserCheck size={16} /> : <UserX size={16} />}
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading ? <p className="p-8 text-center text-sm text-slate-500">Memuat pengguna...</p> : null}
        </div>
      </div>

      {createDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeCreateDialog}
            aria-label="Tutup dialog"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-admin-title"
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Access control
                </p>
                <h3
                  id="create-admin-title"
                  className="mt-1 text-lg font-bold text-[#17376f]"
                >
                  Buat Akun Admin
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Akun baru login melalui halaman admin menggunakan email.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateDialog}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createAdmin}>
              <div className="grid gap-5 p-5">
                {error ? (
                  <div className="flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Tutup pesan"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Nama"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    placeholder="Nama administrator"
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm({ ...form, email: value })}
                    placeholder="admin@company.com"
                    required
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(value) => setForm({ ...form, password: value })}
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                    required
                  />
                  <Field
                    label="Konfirmasi password"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(value) =>
                      setForm({ ...form, password_confirmation: value })
                    }
                    placeholder="Ulangi password"
                    minLength={8}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Role
                    </span>
                    <div className="relative">
                      <select
                        value={form.role}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            role: event.target.value as AdminUser["role"],
                          })
                        }
                        className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#315b9f] focus:ring-2 focus:ring-[#315b9f]/10"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </label>

                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Akun aktif</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Izinkan login setelah dibuat.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.is_active}
                      onClick={() =>
                        setForm({ ...form, is_active: !form.is_active })
                      }
                      className={`relative h-6 w-11 rounded-full transition ${
                        form.is_active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          form.is_active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {form.role === "super_admin" ? (
                  <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                    Super Admin dapat mengelola akun admin dan seluruh fitur
                    dashboard.
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  disabled={creating}
                  className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <Plus size={16} />
                  {creating ? "Membuat akun..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
      />
    </label>
  );
}
