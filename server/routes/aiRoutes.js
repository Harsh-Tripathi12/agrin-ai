import express from "express";

import {
    assistant,
    cropDoctor,
    regenerative,
} from "../controllers/aiController.js";

import {
    requireAuth,
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(
    requireAuth
);


router.post(
    "/assistant",
    assistant
);


router.post(
    "/crop-doctor",
    cropDoctor
);


router.post(
    "/regenerative",
    regenerative
);


export default router;