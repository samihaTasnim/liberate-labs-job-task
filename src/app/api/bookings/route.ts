import { NextRequest, NextResponse } from 'next/server';

// bookings store
let bookings: Booking[] = [];

const RESOURCES = ['Dental', 'Emergency Care', 'Medicine', 'Pediatrics', 'Surgery'];
const BUFFER_MINUTES = 10;
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 120;

interface Booking {
  id: string;
  resource: string;
  start: string; 
  end: string;   
  requestedBy: string;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

function isConflict(newStart: Date, newEnd: Date, resource: string): boolean {
  for (const b of bookings) {
    if (b.resource !== resource) continue;
    const existingStart = addMinutes(new Date(b.start), -BUFFER_MINUTES);
    const existingEnd = addMinutes(new Date(b.end), BUFFER_MINUTES);
    if (newStart < existingEnd && newEnd > existingStart) {
      return true;
    }
  }
  return false;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource');
  const date = searchParams.get('date'); // YYYY-MM-DD
  if (searchParams.get('available') === '1') {
    // Availability check
    if (!resource || !date) {
      return NextResponse.json({ error: 'resource and date required' }, { status: 400 });
    }
    // 15-min slots from 00:00 to 23:45
    const slots: { start: string; end: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const slotStart = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000Z`);
        const slotEnd = new Date(slotStart.getTime() + 15 * 60000);
        // Check if slot is available
        if (!isConflict(slotStart, slotEnd, resource)) {
          slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        }
      }
    }
    return NextResponse.json(slots);
  }
  let filtered = bookings;
  if (resource) {
    filtered = filtered.filter(b => b.resource === resource);
  }
  if (date) {
    filtered = filtered.filter(b => b.start.startsWith(date));
  }
  // Sort by start time ascending
  filtered = filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { resource, start, end, requestedBy } = data;
  if (!RESOURCES.includes(resource)) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }
  if (endDate <= startDate) {
    return NextResponse.json({ error: "End time can't be before the start time" }, { status: 400 });
  }
  const duration = (endDate.getTime() - startDate.getTime()) / 60000;
  if (duration < MIN_DURATION_MINUTES) {
    return NextResponse.json({ error: 'Minimum duration is 15 minutes' }, { status: 400 });
  }
  if (duration > MAX_DURATION_MINUTES) {
    return NextResponse.json({ error: 'Maximum duration is 2 hours' }, { status: 400 });
  }
  if (isConflict(startDate, endDate, resource)) {
    return NextResponse.json({ error: 'A booking already exists in this time frame. Please choose a different time' }, { status: 409 });
  }
  const booking: Booking = {
    id: Math.random().toString(36).slice(2),
    resource,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    requestedBy,
  };
  bookings.push(booking);
  return NextResponse.json(booking, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  bookings.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
} 