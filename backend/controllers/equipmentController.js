import { getDb } from "../data/db.js";
import { newId } from "../utils/ids.js";

export const listEquipment = (req, res) => {
  res.json(getDb().equipment);
};

export const createEquipment = (req, res) => {
  const { name, quantity, rentalFee } = req.body;
  if (!name || quantity === undefined || rentalFee === undefined) {
    return res.status(400).json({ error: "name, quantity, rentalFee are required" });
  }
  const item = { id: newId("e"), name, quantity: Number(quantity), rentalFee: Number(rentalFee) };
  const db = getDb();
  db.equipment.push(item);
  res.status(201).json(item);
};

export const updateEquipment = (req, res) => {
  const db = getDb();
  const item = db.equipment.find((e) => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Equipment not found" });
  Object.assign(item, req.body);
  res.json(item);
};
