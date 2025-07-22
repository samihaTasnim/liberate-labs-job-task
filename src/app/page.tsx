'use client';
import Image from "next/image";
import React, { useEffect, useState } from 'react';

interface Booking {
  id: string;
  resource: string;
  start: string;
  end: string;
  requestedBy: string;
}

const RESOURCES = ['Dental', 'Emergency Care', 'Medicine', 'Pediatrics', 'Surgery'];

function getStatusTag(start: string, end: string) {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (now < s) return 'Upcoming';
  if (now >= s && now <= e) return 'Ongoing';
  return 'Past';
}

export default function Home() {
  const [resource, setResource] = useState(RESOURCES[0]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterResource, setFilterResource] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    let url = '/api/bookings';
    const params = [];
    if (filterResource) params.push(`resource=${encodeURIComponent(filterResource)}`);
    if (filterDate) params.push(`date=${filterDate}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url);
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [filterResource, filterDate]);

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
      fetchBookings();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchBookings();
  };

  // Group bookings by resource
  const grouped = bookings.reduce((acc: Record<string, Booking[]>, b: Booking) => {
    acc[b.resource] = acc[b.resource] || [];
    acc[b.resource].push(b);
    return acc;
  }, {});

  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // sunday is set as the start of the week
    return d;
  }
  function getEndOfWeek(date: Date) {
    const d = getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    return d;
  }
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  // Bookings for the week
  const weekBookings = bookings.filter((b: Booking) => {
    const s = new Date(b.start);
    return s >= weekStart && s <= getEndOfWeek(now);
  });

  return (
    // header
    <main className="max-w-5xl mx-auto p-4 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row items-center justify-between py-6 mb-2 border-b border-blue-100">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Book your appointment</h1>
      </header>

      {/* booking form  */}
      <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Book a Resource</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-medium mb-1 text-blue-900">Resource</label>
              <select className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-300" value={resource} onChange={e => setResource(e.target.value)}>
                {RESOURCES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-blue-900">Start Time</label>
              <input type="datetime-local" className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-300" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1 text-blue-900">End Time</label>
              <input type="datetime-local" className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-300" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1 text-blue-900">Requested By</label>
              <input type="text" className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-300" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} />
            </div>
          </div>
          {error && <div className="text-red-600 font-medium text-center">{error}</div>}
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Book Resource</button>
          </div>
        </form>
      </section>

      {/* filter section */}

      <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div>
            <label className="font-medium mr-2 text-blue-900">Filter by Resource:</label>
            <select className="border border-blue-200 rounded-lg p-2" value={filterResource} onChange={e => setFilterResource(e.target.value)}>
              <option value="">All</option>
              {RESOURCES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium mr-2 text-blue-900">Filter by Date:</label>
            <input type="date" className="border border-blue-200 rounded-lg p-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
        </div>
        <h2 className="text-lg font-bold mb-2 text-blue-800">Bookings Dashboard</h2>
        {loading ? <div>Loading bookings...</div> : (
          <div>
            {Object.keys(grouped).length === 0 && <div className="text-gray-500">No bookings found.</div>}
            {Object.entries(grouped).map(([res, items]: [string, Booking[]]) => (
              <div key={res} className="mb-6">
                <h3 className="text-md font-semibold mb-2 text-blue-700">{res}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="p-2 border">Start</th>
                        <th className="p-2 border">End</th>
                        <th className="p-2 border">Requested By</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((b: Booking) => (
                        <tr key={b.id} className="hover:bg-blue-50 transition">
                          <td className="p-2 border">{new Date(b.start).toLocaleString()}</td>
                          <td className="p-2 border">{new Date(b.end).toLocaleString()}</td>
                          <td className="p-2 border">{b.requestedBy}</td>
                          <td className="p-2 border">
                            <span className={
                              getStatusTag(b.start, b.end) === 'Upcoming' ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded' :
                              getStatusTag(b.start, b.end) === 'Ongoing' ? 'bg-green-100 text-green-800 px-2 py-1 rounded' :
                              'bg-gray-100 text-gray-800 px-2 py-1 rounded'
                            }>
                              {getStatusTag(b.start, b.end)}
                            </span>
                          </td>
                          <td className="p-2 border">
                            <button
                              className="bg-red-500 text-white px-3 py-1 rounded-lg font-medium shadow hover:bg-red-600 transition disabled:opacity-50"
                              onClick={() => handleDelete(b.id)}
                              disabled={deletingId === b.id}
                            >
                              {deletingId === b.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* calendar view */}

      <section className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Weekly Calendar View</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2 border">Resource</th>
                {weekDays.map((d, i) => (
                  <th key={i} className="p-2 border">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map(res => (
                <tr key={res}>
                  <td className="p-2 border font-semibold text-blue-900 bg-blue-50">{res}</td>
                  {weekDays.map((d, i) => {
                    const dayBookings = weekBookings.filter((b: Booking) => b.resource === res && new Date(b.start).toDateString() === d.toDateString());
                    return (
                      <td key={i} className="p-2 border align-top min-w-[120px]">
                        {dayBookings.length === 0 ? <span className="text-gray-400">—</span> : (
                          <ul>
                            {dayBookings.map((b: Booking) => (
                              <li key={b.id} className="mb-1">
                                <span className="block font-medium text-blue-800">{b.requestedBy}</span>
                                <span className="text-blue-700">{new Date(b.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-center text-gray-600 text-xs mt-8 mb-2">
        &copy; {new Date().getFullYear()} Liberate Labs. All rights reserved.
      </footer>
    </main>
  );
}
