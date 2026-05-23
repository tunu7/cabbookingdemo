import express from "express";

import {
  customerRegister,
  customerLogin,
  driverRegister,
  driverLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/customer/register",
  customerRegister
);

router.post(
  "/customer/login",
  customerLogin
);

router.post(
  "/driver/register",
  driverRegister
);

router.post(
  "/driver/login",
  driverLogin
);

export default router;