import { Router } from "express";
import { listEquipment, createEquipment, updateEquipment } from "../controllers/equipmentController.js";

const router = Router();

router.get("/", listEquipment);
router.post("/", createEquipment);
router.put("/:id", updateEquipment);

export default router;
