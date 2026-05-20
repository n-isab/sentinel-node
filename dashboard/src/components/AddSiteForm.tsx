"use client";
import { useState } from "react";

export default function AddSiteForm() {
  const [newUrl, setNewUrl] = useState("");

  const addSites = async () => {
    if (!newUrl) return;
    await fetch("/api/targets", {
      method: "POST",
      body: JSON.stringify({ url: newUrl }),
    });
    setNewUrl("");
    window.location.reload();
    alert("Site added! Refresh your dashboard.");
  };

  return (
    <div className="flex gap-2 mb-8">
      <input
        className="bg-gray-800 border border-gray-700 p-2 rounded-lg flex-1 text-white"
        placeholder="https://example.com"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
      />
      <button onClick={addSites} className="bg-blue-600 px-6 py-2 rounded-lg font-bold">
        Add Sites
      </button>
    </div>
  );
}