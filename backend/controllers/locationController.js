import Driver from "../models/Driver.js";

export const updateDriverLocation = async (
  req,
  res
) => {
  try {
    const { lat, lng } = req.body;

    const driver = await Driver.findById(req.user.id);

    driver.currentLocation = {
      lat,
      lng,
    };

    await driver.save();

    req.io.emit("driver-location-update", {
      driverId: driver._id,
      location: driver.currentLocation,
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};