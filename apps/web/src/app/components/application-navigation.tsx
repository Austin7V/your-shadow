"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Today" },
  { href: "/meals", label: "Meals" },
  { href: "/workout", label: "Workout" },
  { href: "/history", label: "History" },
  { href: "/account", label: "Profile" },
];

export function ApplicationNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="flex w-full gap-1 overflow-x-auto md:w-auto"
    >
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                : "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
