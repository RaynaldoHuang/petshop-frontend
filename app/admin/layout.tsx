"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Megaphone,
  Image as ImageIcon,
  Tags,
  Zap,
  FileText,
  Users
} from "lucide-react";

const menus = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Produk",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Flash Sale",
    href: "/admin/flash-sales",
    icon: Zap,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Announcement",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    label: "Hero Sections",
    href: "/admin/hero-sections",
    icon: ImageIcon,
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: FileText,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-gray-200 bg-white p-6 md:block">
        <h1 className="text-xl font-bold text-gray-900">
          Petshop Admin
        </h1>

        <nav className="mt-8 flex flex-col gap-2">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition
                  ${isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <div className="md:pl-64">{children}</div>
    </div>
  );
}