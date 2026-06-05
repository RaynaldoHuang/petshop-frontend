"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Announcement = {
  id: number;
  text: string;
  link_text: string | null;
  link_href: string | null;
  bg_color: string;
  text_color: string;
  border_color: string | null;
  is_active: boolean;
  sort_order: number;
};

export default function TopAnnouncementBar() {
  const pathname = usePathname();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/announcements/active`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) return;

        const data: Announcement[] = await res.json();
        setAnnouncements(data);
      } catch {
        setAnnouncements([]);
      }
    }

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) {
    return null;
  }

  const active = announcements[activeIndex];

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={`relative min-h-11 overflow-hidden border-b-3 md:h-12 ${active.bg_color} ${
        active.border_color || "border-gray-200"
      }`}
    >
      <div
        key={active.id}
        className="absolute inset-0 flex animate-announcement-slide-up flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-3 py-2 text-center md:flex-nowrap md:gap-3 md:px-4 md:py-0"
      >
        <span
          className={`text-xs font-semibold leading-4 md:text-base md:leading-normal ${active.text_color}`}
        >
          {active.text}
        </span>

        {active.link_text && active.link_href ? (
          <Link
            href={active.link_href}
            className={`text-xs font-bold leading-4 underline underline-offset-4 md:text-base md:leading-normal ${active.text_color}`}
          >
            {active.link_text}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
