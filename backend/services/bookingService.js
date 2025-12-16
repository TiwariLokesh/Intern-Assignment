import { getDb } from "../data/db.js";
import { newId } from "../utils/ids.js";
import { calculatePrice } from "./pricingService.js";
import { slotsOverlap, parseDate } from "../utils/time.js";

const validateBookingPayload = (payload) => {
  const required = ["date", "startTime", "endTime", "courtId", "userName"];
  const missing = required.filter((r) => !payload[r]);
  if (missing.length) return `Missing fields: ${missing.join(", ")}`;
  const start = payload.startTime;
  const end = payload.endTime;
  if (start >= end) return "startTime must be before endTime";
  const parsed = parseDate(payload.date);
  if (!parsed.isValid()) return "Invalid date format";
  return null;
};

const ensureAvailability = (payload, db) => {
  const { courtId, date, startTime, endTime, coachId } = payload;

  const court = db.courts.find((c) => c.id === courtId && c.status === "active");
  if (!court) return "Court not available";

  const courtConflict = db.bookings.some(
    (b) => b.courtId === courtId && b.date === date && slotsOverlap(b.startTime, b.endTime, startTime, endTime)
  );
  if (courtConflict) return "Court already booked for that slot";

  if (coachId) {
    const coach = db.coaches.find((c) => c.id === coachId && c.active);
    if (!coach) return "Coach not available";
    const coachConflict = db.bookings.some(
      (b) => b.coachId === coachId && b.date === date && slotsOverlap(b.startTime, b.endTime, startTime, endTime)
    );
    if (coachConflict) return "Coach already booked for that slot";

    const day = parseDate(date).day();
    const availability = coach.availability.find((a) => a.dayOfWeek === day);
    const within = availability?.slots?.some((range) => {
      const [rangeStart, rangeEnd] = range.split("-");
      return startTime >= rangeStart && endTime <= rangeEnd;
    });
    if (!within) return "Coach not available for this time";
  }

  if (payload.equipmentItems?.length) {
    for (const item of payload.equipmentItems) {
      const eq = db.equipment.find((e) => e.id === item.equipmentId);
      if (!eq) return "Equipment not found";
      const reserved = db.bookings
        .filter((b) => b.date === date && slotsOverlap(b.startTime, b.endTime, startTime, endTime))
        .reduce((sum, b) => {
          const match = (b.equipmentItems || []).find((ei) => ei.equipmentId === item.equipmentId);
          return sum + (match ? match.quantity : 0);
        }, 0);
      if (reserved + item.quantity > eq.quantity) {
        return `${eq.name} insufficient for requested quantity`;
      }
    }
  }

  return null;
};

export const listBookings = () => {
  const db = getDb();
  return db.bookings;
};

export const createBooking = (payload) => {
  const db = getDb();
  const validationError = validateBookingPayload(payload);
  if (validationError) {
    return { error: validationError };
  }

  const availabilityError = ensureAvailability(payload, db);
  if (availabilityError) {
    return { error: availabilityError };
  }

  const price = calculatePrice(payload);

  const booking = {
    id: newId("bk"),
    userName: payload.userName,
    userContact: payload.userContact || "",
    courtId: payload.courtId,
    courtType: db.courts.find((c) => c.id === payload.courtId)?.type || "",
    equipmentItems: payload.equipmentItems || [],
    coachId: payload.coachId || null,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    price,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  db.bookings.push(booking);
  return { booking };
};

export const cancelBooking = (id) => {
  const db = getDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return { error: "Booking not found" };
  db.bookings[idx].status = "cancelled";
  return { booking: db.bookings[idx] };
};
