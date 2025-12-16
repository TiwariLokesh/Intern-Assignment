import { Router } from "express";
import { listPricingRules, createPricingRule, updatePricingRule, deletePricingRule } from "../controllers/pricingRulesController.js";

const router = Router();

router.get("/", listPricingRules);
router.post("/", createPricingRule);
router.put("/:id", updatePricingRule);
router.delete("/:id", deletePricingRule);

export default router;
