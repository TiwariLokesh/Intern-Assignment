import { getDb } from "../data/db.js";
import { slotsOverlap, parseDate } from "../utils/time.js";

const isCourtAvailable = (courtId, date, startTime, endTime, bookings) => {
  return !bookings.some(
    (b) => b.courtId === courtId && b.date === date && slotsOverlap(b.startTime, b.endTime, startTime, endTime)
  );
};

const isCoachAvailable = (coach, date, startTime, endTime, bookings) => {
  if (!coach || !coach.active) return false;
  const dayOfWeek = parseDate(date).day();
  const schedule = coach.availability.find((a) => a.dayOfWeek === dayOfWeek);
  if (!schedule) return false;
  const withinSlot = schedule.slots.some((range) => {
    const [rangeStart, rangeEnd] = range.split("-");
    return !slotsOverlap(rangeStart, rangeEnd, startTime, endTime) ? false : startTime >= rangeStart && endTime <= rangeEnd;
  });
  if (!withinSlot) return false;
  return !bookings.some(
    (b) => b.coachId === coach.id && b.date === date && slotsOverlap(b.startTime, b.endTime, startTime, endTime)
  );
};

const equipmentAvailability = (date, startTime, endTime, bookings, equipment) => {
  return equipment.map((item) => {
    const reserved = bookings
      .filter(
        (b) =>
          b.date === date &&
          slotsOverlap(b.startTime, b.endTime, startTime, endTime)
      )
      .reduce((sum, b) => {
        const match = (b.equipmentItems || []).find((ei) => ei.equipmentId === item.id);
        return sum + (match ? match.quantity : 0);
      }, 0);

    return {
      ...item,
      available: Math.max(item.quantity - reserved, 0)
    };
  });
};

export const getAvailability = (date, startTime, endTime) => {
  const db = getDb();
  const bookings = db.bookings;

  const courts = db.courts
    .filter((c) => c.status === "active")
    .map((court) => ({
      ...court,
      available: isCourtAvailable(court.id, date, startTime, endTime, bookings)
    }));

  const coaches = db.coaches
    .filter((c) => c.active)
    .map((coach) => ({
      ...coach,
      available: isCoachAvailable(coach, date, startTime, endTime, bookings)
    }));

  const equipment = equipmentAvailability(date, startTime, endTime, bookings, db.equipment);

  return { courts, coaches, equipment };
};
