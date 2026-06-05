"use client";

import Link from "next/link";

import {
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Search,
  LogIn,
  ClipboardList,
} from "lucide-react";

import Image from "next/image";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import ProductSearch from "@/components/ProductSearch";
import CartDrawer from "@/components/CartDrawer";

import {
  useEffect,
  useRef,
  useState,
  Suspense,
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

function StoreNavbarContent() {
  const pathname = usePathname();
  const searchParams =
    useSearchParams();
  const currentCategory =
    searchParams.get("category");

  const { isLoggedIn, user, logout } =
    useAuth();

  const [cartOpen, setCartOpen] =
    useState(false);

  const [cartCount, setCartCount] =
    useState(0);

  const [showNavbar, setShowNavbar] =
    useState(true);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const [
    openMobileDropdown,
    setOpenMobileDropdown,
  ] = useState<string | null>(null);

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

      if (
        mobileMenuOpen ||
        mobileSearchOpen
      ) {
        setIsAtTop(
          currentScrollY < 20
        );
        setShowNavbar(true);
        lastScrollY.current =
          currentScrollY;
        return;
      }

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
  }, [mobileMenuOpen, mobileSearchOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function closeMobileSearch() {
    setMobileSearchOpen(false);
  }

  function getHrefCategory(href: string) {
    const query = href.split("?")[1];

    if (!query) {
      return null;
    }

    return new URLSearchParams(query).get(
      "category"
    );
  }

  function getHrefPath(href: string) {
    return href.split("?")[0];
  }

  function isCurrentHref(href: string) {
    const hrefPath = getHrefPath(href);
    const hrefCategory =
      getHrefCategory(href);

    if (hrefPath !== pathname) {
      return false;
    }

    if (hrefCategory) {
      return (
        currentCategory === hrefCategory
      );
    }

    if (hrefPath === "/products") {
      return !currentCategory;
    }

    return true;
  }

  function isNavItemActive(
    item: (typeof navLinks)[number]
  ) {
    if (item.dropdown) {
      return (
        isCurrentHref(item.href) ||
        item.dropdown.some(
          (dropdownItem) =>
            isCurrentHref(
              dropdownItem.href
            )
        )
      );
    }

    return isCurrentHref(item.href);
  }

  return (
    <>
      {/* SPACER */}
      <div
        className={
          hasTopbar
            ? "h-[72px] md:h-24"
            : "h-[72px] md:h-24"
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
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:h-24 md:px-0">
          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => {
              setIsAtTop(
                window.scrollY < 20
              );
              setShowNavbar(true);
              setMobileSearchOpen(false);
              setMobileMenuOpen(
                (open) => !open
              );
            }}
            aria-label={
              mobileMenuOpen
                ? "Tutup menu"
                : "Buka menu"
            }
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 text-blue-950 transition active:bg-orange-50 md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {/* LEFT MENU */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => {
              const active =
                isNavItemActive(item);
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
                          ) => {
                            const dropdownActive =
                              isCurrentHref(
                                dropdownItem.href
                              );

                            return (
                              <Link
                                key={
                                  dropdownItem.href
                                }
                                href={
                                  dropdownItem.href
                                }
                                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${dropdownActive
                                  ? "bg-orange-50 text-orange-500"
                                  : "text-blue-950 hover:bg-orange-50 hover:text-orange-500"
                                  }`}
                              >
                                {
                                  dropdownItem.label
                                }
                              </Link>
                            );
                          }
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
              className="w-36 md:w-44"
              priority
            />
          </Link>

          {/* RIGHT MENU */}
          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <button
              type="button"
              aria-label="Cari produk"
              onClick={() => {
                setIsAtTop(
                  window.scrollY < 20
                );
                setShowNavbar(true);
                setMobileMenuOpen(false);
                setMobileSearchOpen(
                  (open) => !open
                );
              }}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 text-blue-950 transition active:bg-orange-50 md:hidden"
            >
              {mobileSearchOpen ? (
                <X size={21} />
              ) : (
                <Search size={21} />
              )}
            </button>

            <ProductSearch />

            {!isLoggedIn ? (
              <div className="hidden items-center gap-3 md:flex">
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
                <div className="group relative hidden md:block">
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

                <div className="hidden h-8 w-px bg-blue-200 md:block" />
              </>
            )}

            {/* CART */}
            {isLoggedIn ? (
              <button
                onClick={() =>
                  setCartOpen(true)
                }
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center text-blue-950 transition hover:text-orange-500 md:h-auto md:w-auto"
              >
                <ShoppingCart
                  size={24}
                  strokeWidth={2}
                />

                {cartCount > 0 ? (
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white md:-right-3 md:-top-3 md:h-6 md:min-w-6 md:text-xs">
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div
          className={`absolute left-0 top-full w-full border-t border-gray-100 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(25,57,138,0.10)] transition-all duration-300 md:hidden ${mobileSearchOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
            }`}
        >
          <ProductSearch
            autoFocus={mobileSearchOpen}
            className="relative block"
            inputClassName="h-12 w-full rounded-lg"
            dropdownClassName="absolute left-0 right-0 top-[calc(100%+12px)] z-50 max-h-[60vh] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
            usePlaceholderLabel
            onResultClick={closeMobileSearch}
          />
        </div>

        {/* MOBILE MENU */}
        <div
          className={`absolute left-0 top-full w-full border-t border-gray-100 bg-white shadow-[0_18px_40px_rgba(25,57,138,0.10)] transition-all duration-300 md:hidden ${mobileMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
            }`}
        >
          <div className="px-4 py-4">
            <nav className="grid gap-2">
              {navLinks.map((item) => {
                const active =
                  isNavItemActive(item);
                const dropdownOpen =
                  openMobileDropdown ===
                  item.href;

                return (
                  <div
                    key={item.href}
                    className="rounded-lg border border-gray-100 bg-gray-50/60"
                  >
                    {item.dropdown ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMobileDropdown(
                            dropdownOpen
                              ? null
                              : item.href
                          );
                        }}
                        aria-expanded={
                          dropdownOpen
                        }
                        className={`flex min-h-12 w-full items-center justify-between rounded-lg px-4 text-left text-sm font-semibold transition ${active
                          ? "bg-orange-50 text-orange-500"
                          : "text-blue-950 active:bg-orange-50"
                          }`}
                      >
                        <span>{item.label}</span>

                        <ChevronDown
                          size={18}
                          className={`text-blue-300 transition duration-300 ${dropdownOpen
                            ? "rotate-180"
                            : ""
                            }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`flex min-h-12 items-center justify-between rounded-lg px-4 text-sm font-semibold transition ${active
                          ? "bg-orange-50 text-orange-500"
                          : "text-blue-950 active:bg-orange-50"
                          }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    )}

                    {item.dropdown ? (
                      <div
                        className={`grid overflow-hidden transition-all duration-300 ${dropdownOpen
                          ? "max-h-72 opacity-100"
                          : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="grid gap-1 px-3 pb-3">
                          <Link
                            href={item.href}
                            onClick={
                              closeMobileMenu
                            }
                            className={`flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold transition active:bg-white ${isCurrentHref(item.href)
                              ? "bg-white text-orange-500"
                              : "text-orange-500"
                              }`}
                          >
                            Lihat Semua Produk
                          </Link>

                        {item.dropdown.map(
                          (dropdownItem) => {
                            const dropdownActive =
                              isCurrentHref(
                                dropdownItem.href
                              );

                            return (
                              <Link
                                key={
                                  dropdownItem.href
                                }
                                href={
                                  dropdownItem.href
                                }
                                onClick={
                                  closeMobileMenu
                                }
                                className={`flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition active:bg-white active:text-orange-500 ${dropdownActive
                                  ? "bg-white text-orange-500"
                                  : "text-blue-950/75"
                                  }`}
                              >
                                {
                                  dropdownItem.label
                                }
                              </Link>
                            );
                          }
                        )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-gray-100 pt-4">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#19398A]/20 text-sm font-semibold text-[#19398A] transition active:bg-blue-50"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="flex h-12 items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white transition active:bg-orange-600"
                  >
                    Daftar
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="rounded-lg bg-blue-50 px-4 py-3">
                    <p className="truncate text-sm font-bold text-[#19398A]">
                      {user?.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-blue-950/55">
                      {user?.phone}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/orders"
                      onClick={closeMobileMenu}
                      className="flex h-12 items-center justify-center gap-2 rounded-lg border border-blue-100 text-sm font-semibold text-blue-950 transition active:bg-blue-50"
                    >
                      <ClipboardList
                        size={18}
                      />
                      Orders
                    </Link>

                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="flex h-12 items-center justify-center gap-2 rounded-lg border border-blue-100 text-sm font-semibold text-blue-950 transition active:bg-blue-50"
                    >
                      <User size={18} />
                      Profile
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    className="flex h-12 items-center justify-center rounded-lg border border-red-100 text-sm font-semibold text-red-500 transition active:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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

export default function StoreNavbar() {
  return (
    <Suspense fallback={null}>
      <StoreNavbarContent />
    </Suspense>
  );
}
