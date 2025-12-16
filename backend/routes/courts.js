import { Router } from "express";
import { listCourts, createCourt, updateCourt } from "../controllers/courtsController.js";

const router = Router();

router.get("/", listCourts);
router.post("/", createCourt);
router.put("/:id", updateCourt);

export default router;
