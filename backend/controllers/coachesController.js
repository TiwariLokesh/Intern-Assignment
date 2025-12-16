import { getDb } from "../data/db.js";
import { newId } from "../utils/ids.js";

export const listCoaches = (req, res) => {
  res.json(getDb().coaches);
};

export const createCoach = (req, res) => {
  const { name, bio, hourlyRate, availability, active = true } = req.body;
  if (!name || hourlyRate === undefined) {
    return res.status(400).json({ error: "name and hourlyRate are required" });
  }
  const coach = {
    id: newId("co"),
    name,
    bio: bio || "",
    hourlyRate: Number(hourlyRate),
    availability: availability || [],
    active: Boolean(active)
  };
  const db = getDb();
  db.coaches.push(coach);
  res.status(201).json(coach);
};

export const updateCoach = (req, res) => {
  const db = getDb();
  const coach = db.coaches.find((c) => c.id === req.params.id);
  if (!coach) return res.status(404).json({ error: "Coach not found" });
  Object.assign(coach, req.body);
  res.json(coach);
};
