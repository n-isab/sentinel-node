"use client";

import AddSiteForm from "@/components/AddSiteForm";
import PerformanceChart from "@/components/PerformanceChart";
import SiteFilters from "@/components/SiteFilters";
import StatusCard from "@/components/StatusCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  // 1. Create a "State" to hold our list of pings
  const [pings, setPings] = useState<PingData[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTargets, setActiveTargets] = useState([]);

  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();

  // 2. The "Hand" that reaches out to our API
  const fetchStats = async () => {
    setIsRefreshing(true); // start animation / loading
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("stats route not found");
      const data = await response.json(); // This "opens the JSON box" we talked about
      setPings(data);
      //setLoading(false);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // 3. Trigger the fetch as soon as the page loads
  useEffect(() => {
    if (activeTargets.length === 0) {
      console.log("No active targets...!!");

      setPings([]);

      setLoading(false);
      return;
    }
    fetchStats();
    // Refresh every 30 seconds so the dashboard stays "Live"
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [activeTargets]);

  useEffect(() => {
    const getData = async () => {
      try {
        // 1. Fetch the active monitoring list
        const targetRes = await fetch("/api/targets");
        const targetData = await targetRes.json();
        setActiveTargets(targetData);

        // Fetch pings/ logs from charts
        const logsRes = await fetch("/api/stats");
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setPings(logsData);
        }
      } catch (err) {
        console.error("Initial data load failed :", err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleLogout = async () => {
    try {
      // tell the server to delete the cookie
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        // redirect to landing page or login
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  // Filter the pings based on what the user selected
  const filteredPings = selectedUrl
    ? pings.filter((p) => p.metadata.url === selectedUrl)
    : pings;

  if (loading)
    return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">
          Sentinel Monitor Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white transition-all duration-300 hover:bg-red-600 hover:border-red-500 cursor-pointer"
        >
          {/* Simple Logout Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
           Logout
        </button>
      </div>

      {/* Refresh button */}

      <button
        onClick={fetchStats}
        disabled={isRefreshing || activeTargets.length === 0}
        className={`flex items-center gap-2 px-4 py-2 mb-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
      >
        {/* simple svg refresh icon */}

        <svg
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          fill="none"
          viewBox=" 0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
      {/* Input new url to track */}

      <AddSiteForm />

      {/*filtered by selected once */}

      <SiteFilters
        urls={activeTargets.map((t) => t.url)}
        selectedUrl={selectedUrl}
        onSelect={setSelectedUrl}
      />

      {/* --- THE VISUAL CHART --- */}
      <PerformanceChart data={filteredPings} />

      {/* status card*/}

      <div className="grid gap-4">
        {pings.length > 0 ? (
          pings.map((ping) => <StatusCard key={ping._id} ping={ping} />)
        ) : (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-700 rounded-lg">
            No ping data available. Add a site to start monitoring.
          </div>
        )}
      </div>
    </main>
  );
}
