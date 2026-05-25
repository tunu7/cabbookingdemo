import { useEffect, useState } from "react";

import API from "../utils/axios";

import Navbar from "../components/Navbar";

import RideMap from "../components/RideMap";

import socket from "../socket/socket";

function Dashboard() {
  const [pickup, setPickup] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [pickupLocation, setPickupLocation] =
    useState(null);

  const [
    destinationLocation,
    setDestinationLocation,
  ] = useState(null);

  const [driverLocation, setDriverLocation] =
    useState(null);

  const [ride, setRide] =
    useState(null);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(
      window.innerWidth <= 900
    );

  // RESPONSIVE
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 900
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // SOCKET CONNECTION
  useEffect(() => {
    socket.connect();

    // DRIVER LIVE LOCATION
    const handleDriverLocation =
      (data) => {
        console.log(
          "SOCKET DRIVER UPDATE:",
          data
        );

        const liveLocation =
          data?.location;

        if (
          liveLocation?.lat !==
            undefined &&
          liveLocation?.lng !==
            undefined
        ) {
          const formattedLocation =
            {
              lat: Number(
                liveLocation.lat
              ),

              lng: Number(
                liveLocation.lng
              ),
            };

          console.log(
            "SETTING DRIVER LOCATION:",
            formattedLocation
          );

          setDriverLocation(
            formattedLocation
          );
        }
      };

    // RIDE ACCEPTED
    const handleRideAccepted =
      (updatedRide) => {
        console.log(
          "RIDE ACCEPTED:",
          updatedRide
        );

        setRide((prevRide) => {
          if (
            prevRide?._id ===
            updatedRide._id
          ) {
            return updatedRide;
          }

          return prevRide;
        });
      };

    socket.on(
      "driver-location-update",
      handleDriverLocation
    );

    socket.on(
      "ride-accepted",
      handleRideAccepted
    );

    return () => {
      socket.off(
        "driver-location-update",
        handleDriverLocation
      );

      socket.off(
        "ride-accepted",
        handleRideAccepted
      );

      socket.disconnect();
    };
  }, []);

  // CURRENT LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const currentLocation = {
          lat,
          lng,
        };

        setPickupLocation(
          currentLocation
        );

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );

          const data =
            await response.json();

          if (
            data?.display_name
          ) {
            setPickup(
              data.display_name
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    );
  }, []);

  // LIVE RIDE TRACKING
  useEffect(() => {
    if (!ride?._id) return;

    const interval =
      setInterval(async () => {
        try {
          // FETCH UPDATED RIDE
          const rideRes =
            await API.get(
              `/rides/${ride._id}`
            );

          const updatedRide =
            rideRes.data;

          console.log(
            "UPDATED RIDE:",
            updatedRide
          );

          setRide(updatedRide);

          // ONLY FETCH DRIVER LOCATION
          // IF DRIVER EXISTS
          if (
            updatedRide?.driver
          ) {
            const locationRes =
              await API.get(
                `/rides/${ride._id}/driver-location`
              );

            console.log(
              "DRIVER LOCATION RESPONSE:",
              locationRes.data
            );

            const liveLocation =
              locationRes.data
                ?.location;

            if (
              liveLocation?.lat !==
                undefined &&
              liveLocation?.lng !==
                undefined
            ) {
              const formattedLocation =
                {
                  lat: Number(
                    liveLocation.lat
                  ),

                  lng: Number(
                    liveLocation.lng
                  ),
                };

              console.log(
                "POLLING DRIVER LOCATION:",
                formattedLocation
              );

              setDriverLocation(
                formattedLocation
              );
            }
          }
        } catch (error) {
          console.log(error);
        }
      }, 2000);

    return () =>
      clearInterval(interval);
  }, [ride?._id]);

  // GET COORDINATES
  const getCoordinates =
    async (place) => {
      try {
        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              place
            )}`
          );

        const data =
          await response.json();

        if (
          data.length > 0
        ) {
          return {
            lat: Number(
              data[0].lat
            ),

            lng: Number(
              data[0].lon
            ),
          };
        }

        return null;
      } catch (error) {
        console.log(error);

        return null;
      }
    };

  // DISTANCE
  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371e3;

    const φ1 =
      (lat1 * Math.PI) / 180;

    const φ2 =
      (lat2 * Math.PI) / 180;

    const Δφ =
      ((lat2 - lat1) *
        Math.PI) /
      180;

    const Δλ =
      ((lon2 - lon1) *
        Math.PI) /
      180;

    const a =
      Math.sin(Δφ / 2) *
        Math.sin(
          Δφ / 2
        ) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(
          Δλ / 2
        );

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return Math.round(
      R * c
    );
  };

  // DRIVER DISTANCE
  const driverDistance =
    pickupLocation &&
    driverLocation
      ? calculateDistance(
          pickupLocation.lat,
          pickupLocation.lng,
          driverLocation.lat,
          driverLocation.lng
        )
      : 0;

  // ETA
  const eta =
    driverDistance > 0
      ? Math.max(
          1,
          Math.round(
            driverDistance /
              250
          )
        )
      : 0;

  // TRIP DISTANCE
  const tripDistance =
    pickupLocation &&
    destinationLocation
      ? calculateDistance(
          pickupLocation.lat,
          pickupLocation.lng,
          destinationLocation.lat,
          destinationLocation.lng
        )
      : 0;

  // FARE
  const estimatedFare =
    tripDistance > 0
      ? Math.max(
          80,
          Math.round(
            tripDistance / 100
          )
        )
      : 0;

  // BOOK RIDE
  const bookRide =
    async () => {
      try {
        setBookingLoading(
          true
        );

        const destinationCoords =
          destinationLocation ||
          (await getCoordinates(
            destination
          ));

        const res =
          await API.post(
            "/rides/book",
            {
              pickupLocation,
              destinationLocation:
                destinationCoords,
            }
          );

        console.log(
          "BOOKED RIDE:",
          res.data
        );

        setRide(res.data);

        setDestinationLocation(
          destinationCoords
        );

        alert(
          "Ride booked successfully"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Booking failed"
        );
      } finally {
        setBookingLoading(
          false
        );
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "#f3f6fb",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto",
          padding: isMobile
            ? "15px"
            : "30px 20px",
        }}
      >
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              isMobile
                ? "1fr"
                : "420px 1fr",

            gap: "25px",
          }}
        >
          {/* LEFT PANEL */}
          <div
            style={{
              background: "white",

              padding: "25px",

              borderRadius:
                "24px",
            }}
          >
            <h2>
              {ride
                ? "Ride Booked"
                : "Book Ride"}
            </h2>

            <input
              type="text"
              value={pickup}
              onChange={(e) =>
                setPickup(
                  e.target.value
                )
              }
              placeholder="Pickup"
              disabled={!!ride}
              style={{
                width: "100%",
                padding: "15px",
                marginBottom:
                  "15px",
              }}
            />

            <input
              type="text"
              value={destination}
              onChange={(e) =>
                setDestination(
                  e.target.value
                )
              }
              placeholder="Destination"
              disabled={!!ride}
              style={{
                width: "100%",
                padding: "15px",
                marginBottom:
                  "15px",
              }}
            />

            <button
              onClick={
                bookRide
              }
              disabled={
                bookingLoading ||
                !!ride
              }
              style={{
                width: "100%",

                padding: "15px",

                border: "none",

                borderRadius:
                  "12px",

                background:
                  ride
                    ? "#16a34a"
                    : "#111827",

                color: "white",

                fontWeight:
                  "700",
              }}
            >
              {bookingLoading
                ? "Booking..."
                : ride
                ? "Ride Booked"
                : "Book Ride"}
            </button>

            {/* STATS */}
            <div
              style={{
                marginTop: "25px",
              }}
            >
              <h3>
                Ride Stats
              </h3>

              <p>
                Status:
                {" "}
                <strong>
                  {ride?.status ||
                    "WAITING"}
                </strong>
              </p>

              <p>
                ETA:
                {" "}
                <strong>
                  {eta}
                  {" "}
                  min
                </strong>
              </p>

              <p>
                Driver Distance:
                {" "}
                <strong>
                  {
                    driverDistance
                  }
                  {" "}
                  m
                </strong>
              </p>

              <p>
                Trip Distance:
                {" "}
                <strong>
                  {(
                    tripDistance /
                    1000
                  ).toFixed(2)}
                  {" "}
                  km
                </strong>
              </p>

              <p>
                Fare:
                {" "}
                <strong>
                  ₹
                  {
                    estimatedFare
                  }
                </strong>
              </p>

            </div>
          </div>

          {/* MAP */}
          <div
            style={{
              height: isMobile
                ? "500px"
                : "820px",

              borderRadius:
                "24px",

              overflow:
                "hidden",
            }}
          >
            <RideMap
              customerLocation={
                pickupLocation
              }
              destinationLocation={
                destinationLocation
              }
              setDestinationLocation={
                setDestinationLocation
              }
              setDestination={
                setDestination
              }
              driverLocation={
                driverLocation
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;