"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function ProgressCharts({
  lineData,
  metricData
}: {
  lineData: Array<{ date: string; score: number }>;
  metricData: Array<{ metric: string; score: number }>;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="liquid-card rounded-[26px] p-5 lg:col-span-3">
        <h2 className="text-lg font-semibold">Overall score over time</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border) / 0.48)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="hsl(var(--muted))" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted))" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--glass-border))",
                  background: "hsl(var(--background-strong) / 0.92)",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="liquid-card rounded-[26px] p-5 lg:col-span-2">
        <h2 className="text-lg font-semibold">Average metric scores</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border) / 0.48)" strokeDasharray="3 3" />
              <XAxis dataKey="metric" stroke="hsl(var(--muted))" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted))" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--glass-border))",
                  background: "hsl(var(--background-strong) / 0.92)",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar dataKey="score" radius={[10, 10, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
