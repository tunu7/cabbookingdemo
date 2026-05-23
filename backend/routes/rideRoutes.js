import express from "express";

import {
  bookRide,
  getPendingRides,
  acceptRide,
  rejectRide,
  updateRideStatus,
  getRideById,
  getDriverLocation,
} from "../controllers/rideController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// BOOK RIDE
router.post(
  "/book",
  bookRide
);

// PENDING RIDES
router.get(
  "/pending",
  getPendingRides
);

// DRIVER LOCATION
router.get(
  "/:rideId/driver-location",
  getDriverLocation
);

// SINGLE RIDE
router.get(
  "/:id",
  getRideById
);

// ACCEPT
router.post(
  "/:id/accept",
  protect,
  acceptRide
);

// REJECT
router.post(
  "/:id/reject",
  protect,
  rejectRide
);

// UPDATE STATUS
router.patch(
  "/:id/status",
  protect,
  updateRideStatus
);

export default router;