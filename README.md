# Liberate Labs Booking App

A full-stack booking and availability management system built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.  
This app allows users to book resources, check available time slots, and manage bookings with a modern, responsive UI and a green color theme.

---

## Features

- **Book a Resource:**  
  Fill out a form to book a resource (Dental, Emergency Care, Medicine, Pediatrics, Surgery) for a specific time range.

- **Check Available Slots:**  
  Instantly view all available 15-minute slots for a resource on a given date.

- **View Bookings:**  
  - See a weekly calendar view of all bookings by resource.
  - List all bookings, grouped by resource, with filters for resource and date.
  - Status pills for each booking: **Upcoming**, **Ongoing**, or **Past**.
  - Delete bookings with a single click.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
  app/
    page.tsx                # Home page (booking form)
    bookings/page.tsx       # View Bookings page (calendar + list)
    available-slots/page.tsx# Check Available Slots page
    api/
      bookings/route.ts     # API routes for bookings and availability
    layout.tsx              # App layout and navigation
    globals.css             # Global styles (Tailwind)
public/
  *.svg                     # App and favicon assets
```

---

## API Documentation

### `GET /api/bookings`

- **Query Parameters:**
  - `resource` (optional): Filter by resource name.
  - `date` (optional): Filter by start date (`YYYY-MM-DD`).
  - `available=1` (with `resource` and `date`): Returns all available 15-min slots for the resource on the date.

#### Example: Get all bookings for "Dental" on 2024-06-10

```
GET /api/bookings?resource=Dental&date=2024-06-10
```

#### Example: Get available slots

```
GET /api/bookings?available=1&resource=Medicine&date=2024-06-10
```

### `POST /api/bookings`

- **Body:**  
  ```json
  {
    "resource": "Dental",
    "start": "2024-06-10T09:00:00.000Z",
    "end": "2024-06-10T09:30:00.000Z",
    "requestedBy": "Alice"
  }
  ```
- **Validations:**
  - Resource must be one of the allowed types.
  - Duration: 15–120 minutes.
  - No overlap with existing bookings (10 min buffer before and after booking time).

### `DELETE /api/bookings?id=BOOKING_ID`

- Deletes a booking by ID.

---

## UI Pages

### Home (`/`)

- Book a resource using a simple, centered form.
- Success toast on booking.

### Check Available Slots (`/available-slots`)

- Select resource and date.
- View all available 15-min slots.

### View Bookings (`/bookings`)

- Weekly calendar view by resource.
- List bookings with filters (resource, date).
- Status pill (Upcoming, Ongoing, Past).
- Delete bookings.

---

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)

---

## Notes

- **Data Persistence:**  
  Bookings are stored in-memory (serverless function variable). Data will reset on server restart or redeploy.
- **API Security:**  
  This demo does not implement authentication or authorization.

---
