import { getDb } from "../data/db.js";
import { newId } from "../utils/ids.js";

export const listPricingRules = (req, res) => {
  res.json(getDb().pricingRules);
};

export const createPricingRule = (req, res) => {
  const { name, description, type, criteria = {}, amount = 0, mode = "flat", enabled = true } = req.body;
  if (!name || !type) return res.status(400).json({ error: "name and type are required" });
  const rule = { id: newId("pr"), name, description: description || "", type, criteria, amount: Number(amount), mode, enabled };
  const db = getDb();
  db.pricingRules.push(rule);
  res.status(201).json(rule);
};

export const updatePricingRule = (req, res) => {
  const db = getDb();
  const rule = db.pricingRules.find((p) => p.id === req.params.id);
  if (!rule) return res.status(404).json({ error: "Rule not found" });
  Object.assign(rule, req.body);
  res.json(rule);
};

export const deletePricingRule = (req, res) => {
  const db = getDb();
  const idx = db.pricingRules.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Rule not found" });
  const [removed] = db.pricingRules.splice(idx, 1);
  res.json(removed);
};
