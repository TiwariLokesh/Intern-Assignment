import { Router } from "express";
import { listCoaches, createCoach, updateCoach } from "../controllers/coachesController.js";

const router = Router();

router.get("/", listCoaches);
router.post("/", createCoach);
router.put("/:id", updateCoach);

export default router;
