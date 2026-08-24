import express from "express";

import {
    createFarmer,
    getFarmer,
    updateFarmer,
    createFarm,
    getFarms,
} from "../controllers/farmerController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(
    requireAuth
);


router.post(
    "/",
    createFarmer
);


router.get(
    "/:farmerId",
    getFarmer
);


router.put(
    "/:farmerId",
    updateFarmer
);


router.post(
    "/:farmerId/farms",
    createFarm
);


router.get(
    "/:farmerId/farms",
    getFarms
);


export default router;