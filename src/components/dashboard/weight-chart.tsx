"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatDate } from "@/lib/utils";
import type { WeightLog } from "@/types";

interface WeightChartProps {
  logs: WeightLog[];
  targetWeight?: number;
}

export function WeightChart({ logs, targetWeight }: WeightChartProps) {
  const data = logs.map((l) => ({
    date: formatDate(l.logged_at),
    weight: Number(l.weight),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#374151" }}
            labelStyle={{ color: "#6b7280" }}
          />
          {targetWeight && (
            <ReferenceLine y={targetWeight} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "Meta", fill: "#22c55e", fontSize: 11 }} />
          )}
          <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
