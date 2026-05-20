"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PerformanceChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 bg-gray-800 p-4 rounded-xl mb-8 border border-gray-700">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={[...data].reverse()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="timestamp" hide />
          <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value}ms`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
            itemStyle={{ color: "#60A5FA" }}
          />
          <Line type="monotone" dataKey="latency.total" stroke="#3B82F6" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}