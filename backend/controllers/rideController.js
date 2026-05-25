import Ride from "../models/Ride.js";

import Driver from "../models/Driver.js";

// BOOK RIDE
export const bookRide =
  async (req, res) => {

    try {

      const {
        pickupLocation,
        destinationLocation,
      } = req.body;

      const ride =
        await Ride.create({
          pickupLocation,
          destinationLocation,
          status: "PENDING",
        });

      // SOCKET EVENT
      req.io.emit(
        "newRide",
        ride
      );

      res.status(201).json(
        ride
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


// GET PENDING RIDES
export const getPendingRides =
  async (req, res) => {

    try {

      const rides =
        await Ride.find({
          status: "PENDING",
        }).sort({
          createdAt: -1,
        });

      res.json(rides);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


// ACCEPT RIDE
export const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(
      req.params.id
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    ride.driver = req.user.id;

    ride.status = "ACCEPTED";

    await ride.save();

    // IMPORTANT
    req.io.emit(
      "ride-accepted",
      ride
    );

    res.json(ride);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// REJECT RIDE
export const rejectRide =
  async (req, res) => {

    try {

      const ride =
        await Ride.findById(
          req.params.id
        );

      if (!ride) {

        return res
          .status(404)
          .json({
            message:
              "Ride not found",
          });
      }

      ride.status =
        "REJECTED";

      await ride.save();

      res.json({
        message:
          "Ride Rejected",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


// UPDATE RIDE STATUS
export const updateRideStatus =
  async (req, res) => {

    try {

      const ride =
        await Ride.findById(
          req.params.id
        );

      if (!ride) {

        return res
          .status(404)
          .json({
            message:
              "Ride not found",
          });
      }

      ride.status =
        req.body.status;

      await ride.save();

      res.json(ride);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


// GET SINGLE RIDE
export const getRideById =
  async (req, res) => {

    try {

     const ride =
  await Ride.findById(
    req.params.id
  ).populate(
    "driver",
    "name email currentLocation"
  );

      if (!ride) {

        return res
          .status(404)
          .json({
            message:
              "Ride not found",
          });
      }

      res.json(ride);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };


// GET DRIVER LOCATION
export const getDriverLocation =
  async (req, res) => {

    try {

      const ride =
        await Ride.findById(
          req.params.rideId
        );

      if (
        !ride ||
        !ride.driver
      ) {

        return res.json({
          location: null,
        });
      }

      const driver =
        await Driver.findById(
          ride.driver
        );

      if (!driver) {

        return res.json({
          location: null,
        });
      }

      res.json({
        location:
          driver.currentLocation,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };