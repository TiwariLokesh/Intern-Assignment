import { getDb } from "../data/db.js";
import { durationHours } from "../utils/time.js";

const percentDelta = (base, amount) => base * amount;

const matchesRule = (rule, ctx) => {
  if (!rule.enabled) return false;
  const { criteria } = rule;
  switch (rule.type) {
    case "time": {
      const startHour = Number(criteria.startHour);
      const endHour = Number(criteria.endHour);
      const hour = Number(ctx.startTime.split(":" )[0]);
      return hour >= startHour && hour < endHour;
    }
    case "day-of-week": {
      return criteria.daysOfWeek?.includes(ctx.dayOfWeek);
    }
    case "court-type": {
      return criteria.courtType === ctx.court?.type;
    }
    case "equipment": {
      return ctx.totalEquipmentItems > 0;
    }
    case "coach": {
      return Boolean(ctx.coachId);
    }
    default:
      return false;
  }
};

export const calculatePrice = (bookingInput) => {
  const db = getDb();
  const court = db.courts.find((c) => c.id === bookingInput.courtId);
  const coach = bookingInput.coachId
    ? db.coaches.find((c) => c.id === bookingInput.coachId)
    : null;

  const hours = durationHours(bookingInput.startTime, bookingInput.endTime);
  const equipmentItems = bookingInput.equipmentItems || [];
  const equipmentCost = equipmentItems.reduce((sum, item) => {
    const eq = db.equipment.find((e) => e.id === item.equipmentId);
    if (!eq) return sum;
    return sum + eq.rentalFee * item.quantity * hours;
  }, 0);

  const coachCost = coach ? coach.hourlyRate * hours : 0;
  const courtCost = court ? court.baseRate * hours : 0;
  const baseTotal = courtCost + equipmentCost + coachCost;

  const dayOfWeek = new Date(bookingInput.date).getDay();
  const totalEquipmentItems = equipmentItems.reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);

  const ctx = {
    dayOfWeek,
    startTime: bookingInput.startTime,
    court,
    totalEquipmentItems,
    coachId: bookingInput.coachId,
    baseTotal
  };

  const appliedRules = [];
  let adjustments = 0;

  db.pricingRules.forEach((rule) => {
    if (!matchesRule(rule, ctx)) return;
    let delta = 0;
    if (rule.mode === "percent") {
      delta = percentDelta(baseTotal, rule.amount);
    } else if (rule.mode === "flat") {
      delta = rule.amount;
    } else if (rule.mode === "flat-per-item") {
      delta = rule.amount * totalEquipmentItems;
    }

    if (delta !== 0) {
      appliedRules.push({ id: rule.id, name: rule.name, delta, mode: rule.mode });
      adjustments += delta;
    }
  });

  const total = Math.max(0, baseTotal + adjustments);

  const breakdown = {
    hours,
    court: courtCost,
    equipment: equipmentCost,
    coach: coachCost,
    adjustments,
    appliedRules,
    baseTotal,
    total
  };

  return breakdown;
};
