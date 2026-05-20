"use client"

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// This is a "Type" - it's like a map that tells React what our data looks like
interface PingData {
  _id: string;
  timestamp: string;
  metadata: { url: string };
  latency: { total: number };
  status: number;
}

export default function Dashboard() {
  // 1. Create a "State" to hold our list of pings
  const [pings, setPings] = useState<PingData[]>([]);
  const [loading, setLoading] = useState(true);

   const [activeTargets, setActiveTargets] = useState([]);

  // 2. The "Hand" that reaches out to our API
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if(!response.ok) throw new Error('stats route not found')
      const data = await response.json(); // This "opens the JSON box" we talked about
      setPings(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch:", error);
      setLoading(false);
    }
  };

  // 3. Trigger the fetch as soon as the page loads
  useEffect(() => { 
     if(activeTargets.length === 0){
      console.log('No active targets...!!');
  
      setPings([]);
      
      setLoading(false);
      return;
     }
    fetchStats();
    // Refresh every 30 seconds so the dashboard stays "Live"
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [activeTargets]);

  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const [ newUrl, setNewUrl] = useState('');

  const addSites = async () => {
    if(!newUrl) return;
    await fetch ('/api/targets', {
      method: 'POST',
      body: JSON.stringify({ url : newUrl}),
    });
    setNewUrl('');
    alert('Site added ! Restart your monitor.js to start tracking it.');

  }


  useEffect(() => {
    const getData = async () => {
      try{
      // 1. Fetch the active monitoring list
      const targetRes = await fetch ('/api/targets');
      const targetData = await targetRes.json();
      setActiveTargets(targetData);

      // Fetch pings/ logs from charts
      const logsRes = await fetch('/api/stats');
      if(logsRes.ok){
      const logsData = await logsRes.json();
      setPings(logsData);
      }
      }catch (err){
        console.error("Initial data load failed :", err)
      }finally{
        setLoading(false);
      }

    };
    getData();
  }, [])

  // remove an exisiting site

  const removeSite = async (url: string) => {
    if(!confirm(`Are you sure you want to stop monitoring ${url}?`)) return;
    try{
      console.log("Attempting to delete:", url);
    const res = await fetch('/api/targets',{
      method: 'DELETE',
      body:JSON.stringify({ url }),
    });
    if(res.ok){
      // Refresh the page or update state to reflect the change
    window.location.reload();
    }
  } catch (err){
    console.error('Delete failed ..!', err)
  }
  };

  // Get a unique list of URLs from the pings we fetched
 // const uniqueUrls = Array.from(new Set(pings.map((p) => p.metadata.url)));

   // 3. Use activeTargets to create your buttons, NOT the logs
   const uniqueUrls = activeTargets.map(t => t.url);

  // Filter the pings based on what the user selected
  const filteredPings = selectedUrl
    ? pings.filter((p) => p.metadata.url === selectedUrl)
    : pings;

  if (loading)
    return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">
        Sentinel Monitor Dashboard
      </h1>
   {/* Input new url to track */}
       <div className="flex gap-2 mb-8">
        <input 
        className="bg-gray-800 border border-gray-700 p-2 rounded-lg flex-1 text-white"
        placeholder="https://example.com"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
         />

         <button
          onClick={addSites} className="bg-blue-600 px-6 py-2 rounded-lg font-bold">
              Add Sites
         </button>

       </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedUrl(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!selectedUrl ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          All Sites
        </button>

        {uniqueUrls.map((url) => (
          <div key={url} className="relative group mx-1 my-1">
          <button
            onClick={() => setSelectedUrl(url)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedUrl === url ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >
            {url
            .replace("https://", "")
            .replace("www.", "")
            .split(/[/?#]/)[0] // Removes trailing slashes or path 
            }
          </button>
          
          {/* remove button - appear o hover*/}

          <button
          onClick={(e) =>{
            e.stopPropagation(); // prevent main button is clicked too.
            removeSite(url);

          }}
          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full 
               w-5 h-5 flex items-center justify-center text-[10px] 
               opacity-0 group-hover:opacity-100 transition-opacity 
               z-50 shadow-lg border border-gray-900"
          >
            x
          </button>

         </div>
        ))}

      </div>

      {/* --- THE VISUAL CHART --- */}
      <div className="h-64 bg-gray-800 p-4 rounded-xl mb-8 border border-gray-700">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...filteredPings].reverse()}>

            {/* .reverse() so time goes left-to-right */}
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              hide // Hides the messy timestamps on the bottom
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value}ms`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#60A5FA" }}
            />
            <Line
              type="monotone"
              dataKey="latency.total"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false} // Clean look without big dots
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4">
        {pings.map((ping) => (
          <div
            key={ping._id}
            className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-400">
                {new Date(ping.timestamp).toLocaleTimeString()}
              </p>
              <p className="font-mono text-lg">{ping.metadata.url}</p>
            </div>

            <div className="text-right">
              {/* If status is 200, show Green. Otherwise, show Red */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${ping.status === 200 ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}
              >
                {ping.status === 200 ? "ONLINE" : "OFFLINE"}
              </span>
              <p className="text-2xl font-bold mt-1">{ping.latency.total}ms</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
