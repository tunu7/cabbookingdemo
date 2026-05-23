import express from "express";

import { updateDriverLocation } from "../controllers/locationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/update", protect, updateDriverLocation);

export default router;