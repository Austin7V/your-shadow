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
import { ShadowOrb } from "@/app/components/shadow/shadow-orb";

type NavigationVariant = "mobile" | "rail" | "sidebar";

type NavigationItem =
  | {
      href: string;
      label: string;
      icon: LucideIcon;
      available: true;
    }
  | {
      label: string;
      available: false;
    };

type ApplicationNavigationProps = {
  variant: NavigationVariant;
};

const todayNavigationItem = {
  href: "/dashboard",
  label: "Today",
  icon: CalendarDays,
  available: true,
} satisfies NavigationItem;

const mealsNavigationItem = {
  href: "/meals",
  label: "Meals",
  icon: Utensils,
  available: true,
} satisfies NavigationItem;

const workoutNavigationItem = {
  href: "/workout",
  label: "Workout",
  icon: Dumbbell,
  available: true,
} satisfies NavigationItem;

const askShadowNavigationItem = {
  label: "Ask Shadow",
  available: false,
} satisfies NavigationItem;

const historyNavigationItem = {
  href: "/history",
  label: "History",
  icon: ChartNoAxesCombined,
  available: true,
} satisfies NavigationItem;

const profileNavigationItem = {
  href: "/account",
  label: "Profile",
  icon: UserRound,
  available: true,
} satisfies NavigationItem;

const applicationNavigationItems: NavigationItem[] = [
  todayNavigationItem,
  mealsNavigationItem,
  workoutNavigationItem,
  askShadowNavigationItem,
  historyNavigationItem,
  profileNavigationItem,
];

const mobileNavigationItems: NavigationItem[] = [
  todayNavigationItem,
  mealsNavigationItem,
  askShadowNavigationItem,
  workoutNavigationItem,
  historyNavigationItem,
];

const isCurrentRoute = (pathname: string, href: string): boolean => {
  return pathname === href || pathname.startsWith(`${href}/`);
};

function UnavailableNavigationItem({
  item,
  variant,
}: {
  item: Extract<NavigationItem, { available: false }>;
  variant: NavigationVariant;
}) {
  if (variant === "mobile") {
    return (
      <button
        type="button"
        aria-disabled="true"
        aria-label="Ask Shadow. Coming soon."
        title="Ask Shadow is coming soon"
        className="group relative flex min-h-[4.5rem] min-w-0 cursor-not-allowed flex-col items-center justify-center gap-1 px-1 text-xs font-medium text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
      >
        <span className="relative -mt-5 inline-flex size-12 items-center justify-center rounded-full border border-border bg-surface-raised shadow-md">
          <ShadowOrb state="offline" size="compact" />
        </span>
        <span className="max-w-full truncate">{item.label}</span>
      </button>
    );
  }

  if (variant === "rail") {
    return (
      <button
        type="button"
        aria-disabled="true"
        aria-label="Ask Shadow. Coming soon."
        title="Ask Shadow is coming soon"
        className="flex min-h-14 w-full cursor-not-allowed flex-col items-center justify-center gap-1 rounded-control px-1 text-[0.75rem] font-medium text-muted-foreground opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ShadowOrb state="offline" size="compact" />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label="Ask Shadow. Coming soon."
      className="flex min-h-11 w-full cursor-not-allowed items-center gap-3 rounded-control px-3 text-left text-sm font-medium text-muted-foreground opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ShadowOrb state="offline" size="compact" />
      <span>{item.label}</span>
      <span className="ml-auto rounded-compact border border-border px-2 py-0.5 text-xs">
        Soon
      </span>
    </button>
  );
}

function AvailableNavigationItem({
  item,
  pathname,
  variant,
}: {
  item: Extract<NavigationItem, { available: true }>;
  pathname: string;
  variant: NavigationVariant;
}) {
  const Icon = item.icon;
  const isActive = isCurrentRoute(pathname, item.href);

  if (variant === "mobile") {
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 px-1 text-xs transition-colors duration-control focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
          isActive
            ? "font-semibold text-primary"
            : "font-medium text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
        <span className="max-w-full truncate">{item.label}</span>
      </Link>
    );
  }

  if (variant === "rail") {
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        title={item.label}
        className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-control px-1 text-[0.75rem] transition-colors duration-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        }`}
      >
        <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-sm transition-colors duration-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        isActive
          ? "bg-primary font-semibold text-primary-foreground"
          : "font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
      <span>{item.label}</span>
    </Link>
  );
}

export function ApplicationNavigation({
  variant,
}: ApplicationNavigationProps) {
  const pathname = usePathname();
  const items =
    variant === "mobile"
      ? mobileNavigationItems
      : applicationNavigationItems;

  return (
    <nav
      aria-label={
        variant === "mobile"
          ? "Mobile primary navigation"
          : "Primary navigation"
      }
      className={variant === "mobile" ? "grid grid-cols-5" : "space-y-1"}
    >
      {items.map((item) =>
        item.available ? (
          <AvailableNavigationItem
            key={item.href}
            item={item}
            pathname={pathname}
            variant={variant}
          />
        ) : (
          <UnavailableNavigationItem
            key={item.label}
            item={item}
            variant={variant}
          />
        ),
      )}
    </nav>
  );
}
