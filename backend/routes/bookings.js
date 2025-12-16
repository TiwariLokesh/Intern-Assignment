import { Router } from "express";
import { list, create, cancel, quote } from "../controllers/bookingsController.js";

const router = Router();

router.get("/", list);
router.post("/", create);
router.post("/quote", quote);
router.post("/:id/cancel", cancel);

export default router;
