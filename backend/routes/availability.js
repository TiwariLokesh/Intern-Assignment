import { Router } from "express";
import { availability } from "../controllers/availabilityController.js";

const router = Router();

router.get("/", availability);

export default router;
