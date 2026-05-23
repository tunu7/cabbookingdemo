import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },

    pickupLocation: {
      lat: Number,
      lng: Number,
    },

  destinationLocation: {
    lat: Number,
    lng: Number,
  },

    status: {
      type: String,

      enum: [
  "PENDING",
  "ACCEPTED",
  "ARRIVING",
  "STARTED",
  "COMPLETED",
  "REJECTED",
],

      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Ride", rideSchema);