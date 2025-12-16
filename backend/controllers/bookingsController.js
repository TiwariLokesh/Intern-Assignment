import { calculatePrice } from "../services/pricingService.js";
import { createBooking, listBookings, cancelBooking } from "../services/bookingService.js";

export const list = (req, res) => {
  res.json(listBookings());
};

export const create = (req, res) => {
  const { booking, error, waitlisted, entry, message } = createBooking(req.body);
  if (error) return res.status(400).json({ error });
  if (waitlisted) {
    return res.status(202).json({ waitlisted: true, entry, message });
  }
  res.status(201).json(booking);
};

export const cancel = (req, res) => {
  const { booking, error } = cancelBooking(req.params.id);
  if (error) return res.status(404).json({ error });
  res.json(booking);
};

export const quote = (req, res) => {
  try {
    const breakdown = calculatePrice(req.body);
    res.json(breakdown);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
