import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Customer from "../models/Customer.js";
import Driver from "../models/Driver.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const customerRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Customer.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Customer already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      token: generateToken(customer._id, "customer"),
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      token: generateToken(customer._id, "customer"),
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });

    if (!driver) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      driver.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      token: generateToken(driver._id, "driver"),
      driver,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const driverRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Driver.findOne({
      email,
    });

    if (existing) {
      return res.status(400).json({
        message: "Driver already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      token: generateToken(driver._id, "driver"),
      driver,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};