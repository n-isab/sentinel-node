"use client";

interface PingData {
  _id: string;
  timestamp: string;
  metadata: { url: string };
  latency: { total: number };
  status: number;
}

export default function StatusCard({ ping }: { ping: PingData }) {
  const isOnline = ping.status === 200;

  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex justify-between items-center transition-all hover:border-gray-500">
      <div>
        <p className="text-sm text-gray-400">
          {new Date(ping.timestamp).toLocaleTimeString()}
        </p>
        <p className="font-mono text-lg truncate max-w-[200px] md:max-w-none">
          {ping.metadata.url}
        </p>
      </div>

      <div className="text-right">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isOnline ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
        <p className="text-2xl font-bold mt-1">{ping.latency.total}ms</p>
      </div>
    </div>
  );
}