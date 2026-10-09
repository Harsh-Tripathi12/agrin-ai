import express from "express";

import {
    getFarmRisk,
    sendWhatsAppRiskAlert,
    sendTelegramRiskAlert,
} from "../controllers/riskController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(
    requireAuth
);


router.get(
    "/",
    getFarmRisk
);

router.post(
    "/whatsapp-alert",
    sendWhatsAppRiskAlert
);

router.post(
    "/telegram-alert",
    sendTelegramRiskAlert
);


export default router;