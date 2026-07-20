"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import type { StreakDatum } from "@/lib/data/insights";

export function StreakChart({ data }: { data: StreakDatum[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Nog geen dagelijkse ankers.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="habitName"
          width={150}
          tick={{ fontSize: 12, fill: "var(--foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={(props) => <ChartTooltip {...props} formatter={(v) => `${v} dagen`} />}
          cursor={{ fill: "var(--accent)" }}
        />
        <Bar dataKey="streak" name="Streak" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((d) => (
            <Cell key={d.habitName} fill="var(--warning)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
