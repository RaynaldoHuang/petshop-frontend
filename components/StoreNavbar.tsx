"use client";

import Link from "next/link";

import {
  User,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";

import Image from "next/image";

import {
  usePathname,
} from "next/navigation";

import ProductSearch from "@/components/ProductSearch";
import CartDrawer from "@/components/CartDrawer";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { getCart } from "@/lib/cart";
import { useAuth } from "@/contexts/AuthContext";

import logo from "@/public/logo.svg";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Produk Lucky",
    href: "/products",
    dropdown: [
      {
        label: "Makanan Anjing",
        href: "/products?category=woof-meal",
      },
      {
        label: "Makanan Kucing",
        href: "/products?category=meow-meal",
      },
      {
        label: "Mainan Peliharaan",
        href: "/products?category=playtime-fun",
      },
      {
        label: "Perawatan Lucky",
        href: "/care",
      },
    ],
  },
  {
    label: "Galeri Hewan",
    href: "/products?category=paw-showcase",
  },
  {
    label: "Edukasi Lucky",
    href: "/education",
  },
];

function isActivePath(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href;
}

export default function StoreNavbar() {
  const pathname = usePathname();

  const { isLoggedIn, user, logout } =
    useAuth();

  const [cartOpen, setCartOpen] =
    useState(false);

  const [cartCount, setCartCount] =
    useState(0);

  const [showNavbar, setShowNavbar] =
    useState(true);

  const [isAtTop, setIsAtTop] =
    useState(true);

  const [hasTopbar, setHasTopbar] =
    useState(true);

  const lastScrollY = useRef(0);

  /*
  =========================================
  CART COUNT
  =========================================
  */
  useEffect(() => {

    function updateCartCount() {

      const total = getCart().reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

      setCartCount(total);
    }

    updateCartCount();

    /*
    REALTIME CART UPDATE
    */
    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    /*
    CROSS TAB UPDATE
    */
    window.addEventListener(
      "storage",
      updateCartCount
    );

    return () => {

      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  useEffect(() => {
    async function checkAnnouncement() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/announcements/active`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          setHasTopbar(false);
          return;
        }

        const data = await res.json();

        setHasTopbar(data.length > 0);
      } catch {
        setHasTopbar(false);
      }
    }

    checkAnnouncement();

    window.addEventListener(
      "announcement-updated",
      checkAnnouncement
    );

    return () => {
      window.removeEventListener(
        "announcement-updated",
        checkAnnouncement
      );
    };
  }, []);
  /*
=========================================
NAVBAR SHOW / HIDE
=========================================
*/
  useEffect(() => {
    function handleScroll() {
      const currentScrollY =
        window.scrollY;

      /*
      posisi paling atas
      navbar normal tanpa efek
      */
      if (currentScrollY < 20) {
        setIsAtTop(true);
        setShowNavbar(true);
      }

      /*
      scroll pertama kali ke bawah
      navbar tetap muncul
      */
      else if (
        lastScrollY.current < 20 &&
        currentScrollY > 20
      ) {
        setIsAtTop(false);
        setShowNavbar(true);
      }

      /*
      scroll ke bawah lagi
      navbar hide
      */
      else if (
        currentScrollY >
        lastScrollY.current
      ) {
        setIsAtTop(false);
        setShowNavbar(false);
      }

      /*
      scroll ke atas
      navbar show
      */
      else {
        setIsAtTop(false);
        setShowNavbar(true);
      }

      lastScrollY.current =
        currentScrollY;
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
    <>
      {/* SPACER */}
      <div
        className={
          hasTopbar
            ? "h-24"
            : "h-24"
        }
      />

      <header
        className={`fixed left-0 z-50 w-full border-b border-gray-100 bg-white ${isAtTop
          ? hasTopbar
            ? "top-12"
            : "top-0"
          : "top-0"
          } ${isAtTop
            ? ""
            : "transition-all duration-500 ease-in-out"
          } ${showNavbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
          }`}
      >
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between">
          {/* LEFT MENU */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => {
              const active =
                isActivePath(
                  pathname,
                  item.href
                );
              return (
                <div
                  key={item.href}
                  className="group relative flex h-10 items-center"
                >
                  <Link
                    href={item.href}
                    className={`relative flex h-10 items-center gap-1.5 text-sm font-medium transition ${active
                      ? "text-orange-500"
                      : "text-blue-950"
                      } hover:text-orange-500`}
                  >
                    {item.label}

                    {item.dropdown ? (
                      <ChevronDown
                        size={18}
                        className="mt-0.5 transition duration-300 group-hover:rotate-180"
                      />
                    ) : null}

                    <span
                      className={`absolute bottom-0.5 left-0 h-0.5 rounded-full bg-orange-500 transition-all duration-300 ${active
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                        }`}
                    />
                  </Link>

                  {/* DROPDOWN */}
                  {item.dropdown ? (
                    <div className="invisible absolute left-0 top-full mt-3 w-64 translate-y-2 rounded-lg border border-gray-100 bg-white p-3 opacity-0 shadow-sm transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="grid gap-1">
                        {item.dropdown.map(
                          (
                            dropdownItem
                          ) => (
                            <Link
                              key={
                                dropdownItem.href
                              }
                              href={
                                dropdownItem.href
                              }
                              className="rounded-xl px-4 py-3 text-sm font-medium text-blue-950 transition hover:bg-orange-50 hover:text-orange-500"
                            >
                              {
                                dropdownItem.label
                              }
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          {/* LOGO */}
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center"
          >
            <Image
              alt="Lucky Petshop"
              src={logo}
              className="w-44"
              priority
            />
          </Link>

          {/* RIGHT MENU */}
          <div className="ml-auto flex items-center gap-5">
            <ProductSearch />

            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full border border-[#19398A]/20 px-5 py-2.5 text-sm font-semibold text-[#19398A] transition hover:border-orange-500 hover:text-orange-500"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Daftar
                </Link>
              </div>
            ) : (
              <>
                {/* USER */}
                <div className="group relative">
                  <button className="text-blue-950 transition hover:text-orange-500 cursor-pointer">
                    <User
                      size={28}
                      strokeWidth={2}
                    />
                  </button>

                  <div className="invisible absolute right-0 top-[calc(100%+18px)] z-50 w-80 translate-y-3 rounded-3xl bg-white p-5 opacity-0 shadow-md transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="mb-5 border-b border-gray-100 pb-4">
                      <p className="text-lg font-bold text-[#19398A]">
                        {user?.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {user?.phone}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Link
                        href="/orders"
                        className="flex h-16 items-center gap-4 rounded-2xl border border-blue-100 px-5 text-lg font-semibold text-blue-950 transition hover:bg-blue-50"
                      >
                        📄 Orders
                      </Link>

                      <Link
                        href="/profile"
                        className="flex h-16 items-center gap-4 rounded-2xl border border-blue-100 px-5 text-lg font-semibold text-blue-950 transition hover:bg-blue-50"
                      >
                        👤 Profile
                      </Link>

                      <button
                        onClick={logout}
                        className="flex h-16 items-center gap-4 rounded-2xl border border-red-100 px-5 text-lg font-semibold text-red-500 transition hover:bg-red-50"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-blue-200" />
              </>
            )}

            {/* CART */}
            {isLoggedIn ? (
              <button
                onClick={() =>
                  setCartOpen(true)
                }
                className="relative cursor-pointer text-blue-950 transition hover:text-orange-500"
              >
                <ShoppingCart
                  size={24}
                  strokeWidth={2}
                />

                {cartCount > 0 ? (
                  <span className="absolute -right-3 -top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <CartDrawer
        open={cartOpen}
        onClose={() =>
          setCartOpen(false)
        }
      />
    </>
  );
}