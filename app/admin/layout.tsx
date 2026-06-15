/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  ShoppingCart,
  Megaphone,
  Image as ImageIcon,
  Tags,
  Zap,
  FileText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
      { label: "Produk", href: "/admin/products", icon: Package },
      { label: "Kategori", href: "/admin/categories", icon: Tags },
      { label: "Flash Sale", href: "/admin/flash-sales", icon: Zap },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Artikel", href: "/admin/articles", icon: FileText },
      { label: "Hero Banner", href: "/admin/hero-sections", icon: ImageIcon },
      { label: "Pengumuman", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { label: "Pengguna & Role", href: "/admin/users", icon: ShieldCheck },
      { label: "Pelanggan", href: "/admin/customers", icon: Users },
      { label: "Pembayaran", href: "/admin/payment-methods", icon: CreditCard },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Pesanan",
  "/admin/products": "Produk",
  "/admin/categories": "Kategori",
  "/admin/flash-sales": "Flash Sale",
  "/admin/articles": "Artikel",
  "/admin/hero-sections": "Hero Banner",
  "/admin/announcements": "Pengumuman",
  "/admin/users": "Pengguna & Role",
  "/admin/customers": "Pelanggan",
  "/admin/payment-methods": "Metode Pembayaran",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const isAdminLogin = pathname === "/admin/login";
  const hasAdminAccess = user?.role === "super_admin" || user?.role === "admin";

  useEffect(() => {
    if (isAdminLogin) return;
    if (loading) return;

    if (!user) {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!hasAdminAccess) {
      router.replace("/");
    }
  }, [hasAdminAccess, isAdminLogin, loading, pathname, router, user]);

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem("admin-sidebar-collapsed") === "true");
  }, []);

  if (isAdminLogin) {
    return <>{children}</>;
  }

  if (loading || !user || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#183a78]/20 border-t-[#183a78]" />
          Memeriksa akses admin...
        </div>
      </div>
    );
  }

  const currentTitle =
    pageTitles[pathname] ||
    (pathname.startsWith("/admin/products/") ? "Detail Produk" : "Admin");

  function toggleDesktopSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      setLogoutDialogOpen(false);
      router.replace("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const renderSidebar = (collapsed: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={`relative flex h-20 items-center border-b border-white/10 ${
          collapsed ? "justify-center px-3" : "gap-3 px-6"
        }`}
      >
        {!collapsed ? (
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-orange-500 text-lg font-black text-white">
            LP
          </div>
        ) : null}
        <div className={collapsed ? "hidden" : "block"}>
          <p className="font-bold tracking-tight text-white">Lucky Pet</p>
          <p className="text-xs text-blue-200">Commerce Studio</p>
        </div>
        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className={`hidden place-items-center border border-white/15 text-blue-100 transition hover:bg-white/10 hover:text-white lg:grid ${
            collapsed
              ? "h-10 w-10 rounded-md"
              : "ml-auto h-9 w-9 rounded-md"
          }`}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav
        className={`flex-1 py-5 ${
          collapsed ? "overflow-visible px-3" : "space-y-7 overflow-y-auto px-4 py-6"
        }`}
      >
        {menuGroups.map((group) => {
          const items = group.items.filter(
            (item) => item.href !== "/admin/users" || user.role === "super_admin",
          );

          return (
          <div
            key={group.label}
            className={
              collapsed
                ? "mb-4 border-b border-white/10 pb-4 last:mb-0 last:border-b-0 last:pb-0"
                : ""
            }
          >
            <p
              className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/70 ${
                collapsed ? "sr-only" : ""
              }`}
            >
              {group.label}
            </p>
            <div className={collapsed ? "space-y-1" : "space-y-1"}>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setSidebarOpen(false)}
                    aria-label={collapsed ? item.label : undefined}
                    className={`group relative flex items-center text-sm font-medium transition ${
                      collapsed
                        ? "mx-auto h-10 w-10 justify-center rounded-md"
                        : "gap-3 rounded-md px-3 py-2.5"
                    } ${
                      isActive
                        ? collapsed
                          ? "bg-white/12 text-orange-400"
                          : "bg-white text-[#183a78]"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={collapsed ? 19 : 18} strokeWidth={isActive ? 2.3 : 2} />
                    <span className={collapsed ? "sr-only" : "flex-1"}>
                      {item.label}
                    </span>
                    {isActive && !collapsed ? <ChevronRight size={15} /> : null}
                    {collapsed ? (
                      <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">
                        {item.label}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? "p-3" : "p-4"}`}>
        <div
          className={
            collapsed
              ? ""
              : "rounded-lg border border-white/10 bg-white/5 p-3"
          }
        >
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            {!collapsed ? (
              <div className="grid h-9 w-9 place-items-center rounded-md bg-orange-500 font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            ) : null}
            <div className={collapsed ? "hidden" : "min-w-0 flex-1"}>
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs capitalize text-blue-200">
                {user.role?.replace("_", " ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                setLogoutDialogOpen(true);
              }}
              className={`group relative rounded-md p-2 text-blue-200 transition hover:bg-white/10 hover:text-white ${
                collapsed ? "grid h-9 w-9 place-items-center" : ""
              }`}
              aria-label="Logout"
            >
              <LogOut size={17} />
              {collapsed ? (
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">
                  Logout
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden bg-[#102e63] transition-[width] duration-200 lg:block ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {renderSidebar(sidebarCollapsed)}
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          />
          <aside className="relative h-full w-[min(19rem,88vw)] bg-[#102e63]">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-5 z-10 rounded-lg p-2 text-blue-100 hover:bg-white/10"
              aria-label="Tutup sidebar"
            >
              <X size={20} />
            </button>
            {renderSidebar(false)}
          </aside>
        </div>
      ) : null}

      <div
        className={`transition-[padding] duration-200 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-md border border-slate-200 p-2.5 text-slate-600 lg:hidden"
                aria-label="Buka menu"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
                  Admin Console
                </p>
                <h1 className="truncate text-xl font-bold tracking-tight text-[#17376f]">
                  {currentTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center">
              <div className="hidden items-center gap-3 rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-3 sm:flex">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-[#eaf0fb] text-sm font-bold text-[#183a78]">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
                    {user.name}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">
                    {user.role === "super_admin" ? "Super Admin" : "Administrator"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>

      {logoutDialogOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !loggingOut && setLogoutDialogOpen(false)}
            aria-label="Tutup konfirmasi logout"
          />

          <div
            className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <LogOut size={20} />
              </div>

              <h2
                id="logout-dialog-title"
                className="text-lg font-bold text-slate-900"
              >
                Keluar dari admin?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sesi <strong className="text-slate-700">{user.name}</strong> akan
                diakhiri dan Anda kembali ke halaman login admin.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(false)}
                disabled={loggingOut}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                <LogOut size={16} />
                {loggingOut ? "Keluar..." : "Ya, Logout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
