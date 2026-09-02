import {
  AudioLines,
  Check,
  CircleEllipsis,
  MessageCircle,
  Sparkles,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

export const SHADOW_STATES = [
  "idle",
  "listening",
  "thinking",
  "responding",
  "success",
  "attention",
  "offline",
] as const;

export type ShadowState = (typeof SHADOW_STATES)[number];
export type ShadowOrbSize = "compact" | "large";

type ShadowOrbProps = {
  state: ShadowState;
  size?: ShadowOrbSize;
  showStatus?: boolean;
  live?: boolean;
  className?: string;
};

type ShadowStateConfig = {
  status: string;
  icon: LucideIcon;
};

const shadowStateConfig: Record<ShadowState, ShadowStateConfig> = {
  idle: {
    status: "Shadow is ready",
    icon: Sparkles,
  },
  listening: {
    status: "Shadow is listening",
    icon: AudioLines,
  },
  thinking: {
    status: "Shadow is thinking",
    icon: CircleEllipsis,
  },
  responding: {
    status: "Shadow is responding",
    icon: MessageCircle,
  },
  success: {
    status: "Shadow completed the action",
    icon: Check,
  },
  attention: {
    status: "Shadow needs your attention",
    icon: TriangleAlert,
  },
  offline: {
    status: "Shadow is offline",
    icon: WifiOff,
  },
};

export function ShadowOrb({
  state,
  size = "large",
  showStatus = size === "large",
  live = false,
  className,
}: ShadowOrbProps) {
  const config = shadowStateConfig[state];
  const Icon = config.icon;

  return (
    <div
      role={live ? "status" : "img"}
      aria-label={live ? undefined : config.status}
      aria-live={live ? "polite" : undefined}
      aria-atomic={live ? "true" : undefined}
      data-shadow-state={state}
      data-shadow-size={size}
      className={`shadow-orb ${className ?? ""}`}
    >
      <span aria-hidden="true" className="shadow-orb__visual">
        <span className="shadow-orb__aura" />
        <span className="shadow-orb__wave" />
        <span className="shadow-orb__shell" />
        <span className="shadow-orb__ring" />
        <span className="shadow-orb__signal" />
        <span className="shadow-orb__core" />
        <Icon className="shadow-orb__glyph" strokeWidth={2} />
      </span>

      <span
        aria-hidden={live ? undefined : true}
        className={
          showStatus
            ? "rounded-compact border border-border bg-surface-muted px-3 py-1.5 text-sm font-medium text-foreground"
            : "sr-only"
        }
      >
        {config.status}
      </span>
    </div>
  );
}
