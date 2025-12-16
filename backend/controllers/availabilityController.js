import { getAvailability } from "../services/availabilityService.js";

export const availability = (req, res) => {
  const { date, startTime, endTime } = req.query;
  if (!date || !startTime || !endTime) {
    return res.status(400).json({ error: "date, startTime, endTime are required" });
  }
  const data = getAvailability(date, startTime, endTime);
  res.json(data);
};
