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
      background: "#f5f7fb",
    }}
  >
    <Navbar />

    <div
      style={{
        maxWidth: "1500px",
        margin: "0 auto",
        padding: isMobile ? "16px" : "28px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "400px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid #e5e7eb",
            borderRadius: "28px",
            padding: isMobile ? "20px" : "28px",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.06)",
            position: "sticky",
            top: "20px",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "600",
                color: "#6b7280",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Ride Dashboard
            </p>

            <h2
              style={{
                marginTop: "8px",
                marginBottom: "8px",
                fontSize: isMobile
                  ? "28px"
                  : "34px",
                fontWeight: "800",
                color: "#111827",
                lineHeight: 1.1,
              }}
            >
              {ride
                ? "Your Ride is Active"
                : "Book a Ride"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Fast, reliable and live-tracked
              rides in real time.
            </p>
          </div>

          {/* INPUTS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Pickup Location
              </label>

              <input
                type="text"
                value={pickup}
                onChange={(e) =>
                  setPickup(
                    e.target.value
                  )
                }
                placeholder="Enter pickup location"
                disabled={!!ride}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  border:
                    "1px solid #d1d5db",
                  background: ride
                    ? "#f3f4f6"
                    : "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                  transition: "0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Destination
              </label>

              <input
                type="text"
                value={destination}
                onChange={(e) =>
                  setDestination(
                    e.target.value
                  )
                }
                placeholder="Where do you want to go?"
                disabled={!!ride}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  border:
                    "1px solid #d1d5db",
                  background: ride
                    ? "#f3f4f6"
                    : "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                  transition: "0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              onClick={bookRide}
              disabled={
                bookingLoading || !!ride
              }
              style={{
                width: "100%",
                padding: "16px",
                border: "none",
                borderRadius: "18px",
                background: ride
                  ? "#16a34a"
                  : "#111827",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor:
                  bookingLoading || ride
                    ? "not-allowed"
                    : "pointer",
                transition: "0.25s",
                boxShadow: ride
                  ? "0 8px 20px rgba(22,163,74,0.25)"
                  : "0 8px 20px rgba(17,24,39,0.18)",
              }}
            >
              {bookingLoading
                ? "Booking Ride..."
                : ride
                ? "Ride Booked"
                : "Book Ride"}
            </button>
          </div>

          {/* STATS */}
          <div
            style={{
              marginTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "18px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Ride Stats
              </h3>

              <div
                style={{
                  padding:
                    "6px 12px",
                  borderRadius:
                    "999px",
                  background:
                    ride?.status ===
                    "ACCEPTED"
                      ? "#dcfce7"
                      : "#f3f4f6",
                  color:
                    ride?.status ===
                    "ACCEPTED"
                      ? "#166534"
                      : "#374151",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {ride?.status ||
                  "WAITING"}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "14px",
              }}
            >
              {/* ETA */}
              <div
                style={{
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "20px",
                  padding: "18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  ETA
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize: "28px",
                    color: "#111827",
                  }}
                >
                  {eta}
                  <span
                    style={{
                      fontSize:
                        "14px",
                      color:
                        "#6b7280",
                      marginLeft:
                        "4px",
                    }}
                  >
                    min
                  </span>
                </h2>
              </div>

              {/* DRIVER DISTANCE */}
              <div
                style={{
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "20px",
                  padding: "18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Driver Distance
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize: "28px",
                    color: "#111827",
                  }}
                >
                  {driverDistance}
                  <span
                    style={{
                      fontSize:
                        "14px",
                      color:
                        "#6b7280",
                      marginLeft:
                        "4px",
                    }}
                  >
                    m
                  </span>
                </h2>
              </div>

              {/* TRIP DISTANCE */}
              <div
                style={{
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "20px",
                  padding: "18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Trip Distance
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize: "28px",
                    color: "#111827",
                  }}
                >
                  {(
                    tripDistance /
                    1000
                  ).toFixed(1)}
                  <span
                    style={{
                      fontSize:
                        "14px",
                      color:
                        "#6b7280",
                      marginLeft:
                        "4px",
                    }}
                  >
                    km
                  </span>
                </h2>
              </div>

              {/* FARE */}
              <div
                style={{
                  background:
                    "#111827",
                  color: "#ffffff",
                  borderRadius:
                    "20px",
                  padding: "18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color:
                      "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Estimated Fare
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize: "28px",
                    color: "#ffffff",
                  }}
                >
                  ₹{estimatedFare}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div
          style={{
            height: isMobile
              ? "500px"
              : "calc(100vh - 120px)",
            minHeight: "500px",
            borderRadius: "30px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.08)",
            background: "#ffffff",
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