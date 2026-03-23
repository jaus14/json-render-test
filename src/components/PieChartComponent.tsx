import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import type { ComponentFn } from "@json-render/react";
import type { Catalog } from "../lib/catalog";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "./ui/chart";

const COLORS = [
  "oklch(0.65 0.20 25)",   // red
  "oklch(0.65 0.20 145)",  // green
  "oklch(0.65 0.20 250)",  // blue
  "oklch(0.65 0.20 55)",   // orange
  "oklch(0.65 0.20 310)",  // purple
  "oklch(0.70 0.15 85)",   // yellow
  "oklch(0.60 0.18 190)",  // teal
  "oklch(0.55 0.20 340)",  // pink
];

export const PieChartComponent: ComponentFn<Catalog, "PieChart"> = ({
  props,
}) => {
  const labels = (props.labels ?? []) as string[];
  const values = (props.values ?? []) as number[];
  const caption = (props.caption ?? null) as string | null;

  const data = useMemo(
    () =>
      labels.map((label, i) => ({
        name: label,
        value: values[i] ?? 0,
      })),
    [labels, values]
  );

  const config = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {};
    labels.forEach((label, i) => {
      cfg[label] = {
        label,
        color: COLORS[i % COLORS.length],
      };
    });
    return cfg;
  }, [labels]);

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        データがありません
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border p-4">
      {caption && (
        <p className="mb-2 text-center text-sm text-muted-foreground">
          {caption}
        </p>
      )}
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeWidth={2}
              stroke="var(--color-background, #fff)"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip config={config} nameKey="name" />
            <Legend
              verticalAlign="bottom"
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
