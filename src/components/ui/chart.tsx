import * as React from "react";
import { Tooltip as RechartsTooltip } from "recharts";

// ── Chart config type ────────────────────────────────────────────────
export type ChartConfig = Record<
  string,
  { label: string; color: string }
>;

// ── ChartContainer ───────────────────────────────────────────────────
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  const cssVars = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[`--color-${key}`] = value.color;
      return acc;
    },
    {}
  );

  return (
    <div
      className={className}
      style={{ ...cssVars } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

// ── ChartTooltipContent ──────────────────────────────────────────────
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: Record<string, unknown>;
  }>;
  config?: ChartConfig;
  hideLabel?: boolean;
  nameKey?: string;
}

function ChartTooltipContent({
  active,
  payload,
  config,
  nameKey,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {payload.map((entry, i) => {
        const key = nameKey
          ? String(entry.payload[nameKey] ?? entry.name)
          : entry.name;
        const cfg = config?.[key];
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cfg?.color ?? "currentColor" }}
            />
            <span className="text-muted-foreground">
              {cfg?.label ?? key}:
            </span>
            <span className="font-medium">{entry.value.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

// Re-export RechartsTooltip with our content as default
export function ChartTooltip({
  config,
  nameKey,
  ...props
}: React.ComponentProps<typeof RechartsTooltip> & {
  config?: ChartConfig;
  nameKey?: string;
}) {
  return (
    <RechartsTooltip
      content={
        <ChartTooltipContent config={config} nameKey={nameKey} />
      }
      {...props}
    />
  );
}
