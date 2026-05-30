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
      className={`relative h-12 overflow-hidden border-b-3 ${active.bg_color} ${
        active.border_color || "border-gray-200"
      }`}
    >
      <div
        key={active.id}
        className="absolute inset-0 flex animate-announcement-slide-up items-center justify-center gap-3 px-4 text-center"
      >
        <span
          className={`text-sm font-semibold md:text-base ${active.text_color}`}
        >
          {active.text}
        </span>

        {active.link_text && active.link_href ? (
          <Link
            href={active.link_href}
            className={`text-sm font-bold underline underline-offset-4 md:text-base ${active.text_color}`}
          >
            {active.link_text}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
