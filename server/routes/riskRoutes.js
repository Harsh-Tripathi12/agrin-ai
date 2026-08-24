import express from "express";

import {
    getFarmRisk,
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


export default router;