import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ComponentFn } from "@json-render/react";
import type { Catalog } from "../lib/catalog";
import { ChartContainer, ChartTooltip, type ChartConfig } from "./ui/chart";

const COLORS = [
  "oklch(0.65 0.20 25)",
  "oklch(0.65 0.20 145)",
  "oklch(0.65 0.20 250)",
  "oklch(0.65 0.20 55)",
  "oklch(0.65 0.20 310)",
  "oklch(0.70 0.15 85)",
  "oklch(0.60 0.18 190)",
  "oklch(0.55 0.20 340)",
];

export const LineChartComponent: ComponentFn<Catalog, "LineChart"> = ({
  props,
}) => {
  const xLabels = (props.xLabels ?? []) as string[];
  const series = (props.series ?? []) as Array<{
    name: string;
    values: number[];
  }>;
  const caption = (props.caption ?? null) as string | null;
  const xAxisLabel = (props.xAxisLabel ?? null) as string | null;
  const yAxisLabel = (props.yAxisLabel ?? null) as string | null;

  const data = useMemo(
    () =>
      xLabels.map((label, i) => {
        const point: Record<string, unknown> = { x: label };
        for (const s of series) {
          point[s.name] = s.values[i] ?? 0;
        }
        return point;
      }),
    [xLabels, series]
  );

  const config = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {};
    series.forEach((s, i) => {
      cfg[s.name] = { label: s.name, color: COLORS[i % COLORS.length] };
    });
    return cfg;
  }, [series]);

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
      <ChartContainer config={config} className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              label={
                xAxisLabel
                  ? { value: xAxisLabel, position: "bottom", offset: 10, fontSize: 12 }
                  : undefined
              }
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      fontSize: 12,
                      style: { textAnchor: "middle" },
                    }
                  : undefined
              }
            />
            <ChartTooltip config={config} />
            {series.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
            <Legend
              verticalAlign="top"
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
