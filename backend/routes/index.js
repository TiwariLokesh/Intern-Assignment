import { Router } from "express";
import courts from "./courts.js";
import equipment from "./equipment.js";
import coaches from "./coaches.js";
import pricingRules from "./pricingRules.js";
import bookings from "./bookings.js";
import availability from "./availability.js";

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.use("/courts", courts);
router.use("/equipment", equipment);
router.use("/coaches", coaches);
router.use("/pricing-rules", pricingRules);
router.use("/bookings", bookings);
router.use("/availability", availability);

export default router;
