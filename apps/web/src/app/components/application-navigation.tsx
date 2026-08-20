"use client";

import {
  CalendarDays,
  ChartNoAxesCombined,
  Dumbbell,
  type LucideIcon,
  UserRound,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Today", icon: CalendarDays },
  { href: "/meals", label: "Meals", icon: Utensils },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/history", label: "History", icon: ChartNoAxesCombined },
  { href: "/account", label: "Profile", icon: UserRound },
];

export function ApplicationNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Primary navigation" className="hidden xl:flex xl:gap-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                  : "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav
        aria-label="Mobile primary navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface xl:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-primary"
                    : "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                }
              >
                <Icon aria-hidden="true" size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
