import dayjs from "dayjs";

export const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

export const slotsOverlap = (startA, endA, startB, endB) => {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
};

export const durationHours = (start, end) => {
  return (toMinutes(end) - toMinutes(start)) / 60;
};

export const parseDate = (dateStr) => dayjs(dateStr, "YYYY-MM-DD", true);
