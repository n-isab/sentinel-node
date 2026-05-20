"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-500">Sentinel Monitor</h1>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 rounded hover:bg-gray-700 transition">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-6 text-center">
        <h2 className="text-5xl font-extrabold mb-6">Real-Time Performance Intelligence</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Monitor your web applications' speed, health, and status with automated Node.js scripts and Discord alerts.
        </p>
        <Link href="/signup" className="px-8 py-4 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg transition">
          Start Monitoring for Free
        </Link>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-gray-850 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="p-8 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-blue-400">Website Speed Monitoring</h3>
            <p className="text-gray-400">Track response times (ms) across your global endpoints in real-time.</p>
          </div>
          <div className="p-8 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-green-400">Discord Integration</h3>
            <p className="text-gray-400">Receive instant alerts via Webhooks the moment your site goes down.</p>
          </div>
          <div className="p-8 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Performance History</h3>
            <p className="text-gray-400">View detailed logs of uptime and latency stored securely in MongoDB Atlas.</p>
          </div>
        </div>
      </section>
    </div>
  );
}