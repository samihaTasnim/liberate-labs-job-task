'use client';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Booking {
  id: string;
  resource: string;
  start: string;
  end: string;
  requestedBy: string;
}

const RESOURCES = ['Dental', 'Emergency Care', 'Medicine', 'Pediatrics', 'Surgery'];

export default function Home() {
  const [resource, setResource] = useState(RESOURCES[0]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resource || !start || !end || !requestedBy) {
      setError('All fields are required.');
      return;
    }
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }
    const duration = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    if (duration < 15) {
      setError('Minimum duration is 15 minutes.');
      return;
    }
    if (duration > 120) {
      setError('Maximum duration is 2 hours.');
      return;
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, start, end, requestedBy }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Booking failed');
    } else {
      setResource(RESOURCES[0]);
      setStart('');
      setEnd('');
      setRequestedBy('');
      toast.success('Booking successful!');
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-4 flex flex-col gap-8">
      <ToastContainer position="top-center" autoClose={2500} />
      <header className="flex flex-col sm:flex-row items-center justify-between py-6 mb-2 border-b border-green-100">
        <h1 className="text-3xl font-extrabold tracking-tight text-green-900">Book your appointment</h1>
      </header>
      <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-green-100">
        <h2 className="text-xl font-bold mb-4 text-green-800">Book a Resource</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-6 items-center">
            <div className="w-full flex flex-col items-center">
              <label className="block font-medium mb-1 text-green-900 text-center">Resource</label>
              <select className="w-64 border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-300 text-center" value={resource} onChange={e => setResource(e.target.value)}>
                {RESOURCES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="w-full flex flex-col items-center">
              <label className="block font-medium mb-1 text-green-900 text-center">Start Time</label>
              <input type="datetime-local" className="w-64 border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-300 text-center" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div className="w-full flex flex-col items-center">
              <label className="block font-medium mb-1 text-green-900 text-center">End Time</label>
              <input type="datetime-local" className="w-64 border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-300 text-center" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <div className="w-full flex flex-col items-center">
              <label className="block font-medium mb-1 text-green-900 text-center">Requested By</label>
              <input type="text" className="w-64 border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-300 text-center" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} />
            </div>
          </div>
          {error && <div className="text-red-600 font-medium text-center">{error}</div>}
          <div className="flex justify-center">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">Book Resource</button>
          </div>
        </form>
      </section>
      <footer className="text-center text-gray-600 text-xs mt-8 mb-2">
        &copy; {new Date().getFullYear()} Liberate Labs. All rights reserved.
      </footer>
    </main>
  );
}
