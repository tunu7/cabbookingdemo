import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

import socketHandler from "./socket/socket.js";

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

socketHandler(io);

app.use(
  cors({
    origin: [
      "https://cabbookingdemo-bo7u.vercel.app/",
      "https://cabbookingdemo.vercel.app/"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);

app.use("/api/rides", rideRoutes);

app.use("/api/location", locationRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});