import Driver from "../models/Driver.js";

export const updateDriverLocation =
  async (req, res) => {

    try {

      console.log(
        "========== LOCATION UPDATE =========="
      );

      console.log(
        "REQ USER:",
        req.user
      );

      console.log(
        "BODY:",
        req.body
      );

      const { lat, lng } =
        req.body;

      // VALIDATION
      if (
        lat === undefined ||
        lng === undefined
      ) {

        return res
          .status(400)
          .json({
            message:
              "Latitude and longitude required",
          });
      }

      // FIND DRIVER
      const driver =
        await Driver.findById(
          req.user.id
        );

      console.log(
        "FOUND DRIVER:",
        driver
      );

      // DRIVER NOT FOUND
      if (!driver) {

        return res
          .status(404)
          .json({
            message:
              "Driver not found",
          });
      }

      // UPDATE LOCATION
      driver.currentLocation =
        {
          lat: Number(lat),
          lng: Number(lng),
        };

      console.log(
        "BEFORE SAVE:",
        driver.currentLocation
      );

      // SAVE
      await driver.save();

      console.log(
        "AFTER SAVE:",
        driver.currentLocation
      );

      // SOCKET EMIT
      req.io.emit(
        "driver-location-update",
        {
          driverId:
            driver._id,

          location:
            driver.currentLocation,
        }
      );

      console.log(
        "SOCKET EMITTED SUCCESSFULLY"
      );

      res.json({
        success: true,

        location:
          driver.currentLocation,
      });

    } catch (error) {

      console.log(
        "LOCATION CONTROLLER ERROR:"
      );

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };