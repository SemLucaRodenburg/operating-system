"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import type { DomainHoursDatum } from "@/lib/data/insights";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function DomainHoursChart({
  data,
  domainNames,
}: {
  data: DomainHoursDatum[];
  domainNames: string[];
}) {
  const hasData = data.some((row) =>
    domainNames.some((name) => typeof row[name] === "number" && (row[name] as number) > 0)
  );

  if (!hasData) {
    return (
      <p className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">
        Nog geen voltooide ankers deze weken.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip
          content={(props) => <ChartTooltip {...props} formatter={(v) => `${v} uur`} />}
          cursor={{ fill: "var(--accent)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          iconType="circle"
          iconSize={8}
        />
        {domainNames.map((name, i) => (
          <Bar
            key={name}
            dataKey={name}
            name={name}
            fill={SERIES_COLORS[i % SERIES_COLORS.length]}
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
