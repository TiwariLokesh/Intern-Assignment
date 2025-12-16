import { getDb } from "../data/db.js";
import { newId } from "../utils/ids.js";

export const listCourts = (req, res) => {
  const db = getDb();
  res.json(db.courts);
};

export const createCourt = (req, res) => {
  const { name, type, baseRate, status } = req.body;
  if (!name || !type || !baseRate) {
    return res.status(400).json({ error: "name, type, baseRate are required" });
  }
  const court = { id: newId("c"), name, type, baseRate: Number(baseRate), status: status || "active" };
  const db = getDb();
  db.courts.push(court);
  res.status(201).json(court);
};

export const updateCourt = (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const court = db.courts.find((c) => c.id === id);
  if (!court) return res.status(404).json({ error: "Court not found" });
  Object.assign(court, req.body);
  res.json(court);
};
