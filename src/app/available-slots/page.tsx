"use client";
import React, { useState } from "react";

const RESOURCES = ["Dental", "Emergency Care", "Medicine", "Pediatrics", "Surgery"];

export default function AvailableSlotsPage() {
  const [resource, setResource] = useState(RESOURCES[0]);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkSlots = async () => {
    setError("");
    if (!resource || !date) {
      setError("Please select a resource and date.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/bookings?available=1&resource=${encodeURIComponent(resource)}&date=${date}`);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to fetch slots");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSlots(data);
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-4 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-green-900 mb-4">Check Available Slots</h1>
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div>
            <label className="font-medium mr-2 text-green-900">Resource:</label>
            <select className="border border-green-200 rounded-lg p-2" value={resource} onChange={e => setResource(e.target.value)}>
              {RESOURCES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium mr-2 text-green-900">Date:</label>
            <input type="date" className="border border-green-200 rounded-lg p-2" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button onClick={checkSlots} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">Check</button>
        </div>
        {error && <div className="text-red-600 font-medium text-center mb-2">{error}</div>}
        {loading ? <div>Loading slots...</div> : (
          <div>
            {slots.length === 0 && <div className="text-gray-500">No available slots found.</div>}
            {slots.length > 0 && (
              <ul className="divide-y divide-green-100">
                {slots.map((slot, i) => (
                  <li key={i} className="py-2 flex gap-4 items-center">
                    <span className="text-green-700 font-mono">{new Date(slot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(slot.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
} 