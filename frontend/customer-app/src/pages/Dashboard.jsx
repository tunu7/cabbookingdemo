import { useEffect, useState } from "react";

import API from "../utils/axios";

import Navbar from "../components/Navbar";

import RideMap from "../components/RideMap";

function Dashboard() {
  const [bookingLoading, setBookingLoading] =
    useState(false);

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

  const [isMobile, setIsMobile] =
    useState(
      window.innerWidth <= 900
    );

  // RESPONSIVE CHECK
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

  // GET CURRENT LOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation not supported"
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords
            .latitude;

        const lng =
          position.coords
            .longitude;

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
      },

      (error) => {
        console.log(error);

        alert(
          "Unable to fetch current location"
        );
      },

      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  // FETCH LIVE RIDE DATA
  useEffect(() => {
    if (!ride?._id) {
      return;
    }

    const fetchRideData =
      async () => {
        try {
          const locationRes =
            await API.get(
              `/rides/${ride._id}/driver-location`
            );

          if (
            locationRes.data
              ?.location
          ) {
            setDriverLocation(
              locationRes.data
                .location
            );
          }

          const rideRes =
            await API.get(
              `/rides/${ride._id}`
            );

          if (
            rideRes.data
          ) {
            setRide(
              rideRes.data
            );
          }
        } catch (error) {
          console.log(error);
        }
      };

    fetchRideData();

    const interval =
      setInterval(
        fetchRideData,
        3000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [ride?._id]);

  // GET COORDINATES
  const getCoordinates =
    async (place) => {
      try {
        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
          );

        const data =
          await response.json();

        if (
          data &&
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

  // CALCULATE DISTANCE
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

  const distance =
    pickupLocation &&
    driverLocation
      ? calculateDistance(
          pickupLocation.lat,
          pickupLocation.lng,
          driverLocation.lat,
          driverLocation.lng
        )
      : 0;

  // BOOK RIDE
  const bookRide =
    async () => {
      if (
        !pickup ||
        !destination
      ) {
        alert(
          "Please enter locations"
        );

        return;
      }

      try {
        setBookingLoading(
          true
        );

        const pickupCoords =
          await getCoordinates(
            pickup
          );

        const destinationCoords =
          await getCoordinates(
            destination
          );

        if (
          !pickupCoords ||
          !destinationCoords
        ) {
          alert(
            "Location not found"
          );

          setBookingLoading(
            false
          );

          return;
        }

        setPickupLocation(
          pickupCoords
        );

        setDestinationLocation(
          destinationCoords
        );

        const res =
          await API.post(
            "/rides/book",
            {
              pickupLocation:
                pickupCoords,

              destinationLocation:
                destinationCoords,
            }
          );

        setRide(
          res.data
        );

        alert(
          "Ride Requested Successfully"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Booking Failed"
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
          "#f4f7fb",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: isMobile
            ? "15px"
            : "30px 20px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile
                ? "28px"
                : "36px",

              fontWeight: "700",

              color: "#111827",

              marginBottom: "8px",
            }}
          >
            Ride Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",

              fontSize: isMobile
                ? "14px"
                : "16px",
            }}
          >
            Book rides and track
            your driver live in
            real-time.
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              isMobile
                ? "1fr"
                : "400px 1fr",

            gap: "25px",
          }}
        >
          {/* LEFT PANEL */}
          <div
            style={{
              background: "white",

              padding: isMobile
                ? "18px"
                : "25px",

              borderRadius: "20px",

              boxShadow:
                "0 8px 25px rgba(0,0,0,0.06)",

              height: "fit-content",
            }}
          >
            <h2
              style={{
                marginBottom: "25px",

                color: "#111827",

                fontSize: isMobile
                  ? "22px"
                  : "26px",
              }}
            >
              Book a Ride
            </h2>

            {/* PICKUP */}
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                style={{
                  display: "block",

                  marginBottom: "8px",

                  fontWeight: "600",

                  color: "#374151",
                }}
              >
                Pickup Location
              </label>

              <input
                type="text"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={(e) =>
                  setPickup(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",

                  padding: "14px",

                  border:
                    "1px solid #d1d5db",

                  borderRadius:
                    "12px",

                  fontSize: "15px",

                  outline: "none",

                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            {/* DESTINATION */}
            <div
              style={{
                marginBottom: "25px",
              }}
            >
              <label
                style={{
                  display: "block",

                  marginBottom: "8px",

                  fontWeight: "600",

                  color: "#374151",
                }}
              >
                Destination
              </label>

              <input
                type="text"
                placeholder="Enter destination"
                value={
                  destination
                }
                onChange={(e) =>
                  setDestination(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",

                  padding: "14px",

                  border:
                    "1px solid #d1d5db",

                  borderRadius:
                    "12px",

                  fontSize: "15px",

                  outline: "none",

                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            {/* BUTTON */}
            <button
              onClick={
                bookRide
              }
              disabled={ride}
              style={{
                width: "100%",

                padding: "15px",

                border: "none",

                borderRadius:
                  "12px",

                fontSize: "16px",

                fontWeight: "600",

                cursor:
                  ride
                    ? "not-allowed"
                    : "pointer",

                background:
                  ride
                    ? "#16a34a"
                    : "#111827",

                color: "white",

                transition:
                  "0.3s ease",
              }}
            >
              {bookingLoading
                ? "Booking Ride..."
                : ride
                ? "Ride Booked"
                : "Book Ride"}
            </button>

            {/* RIDE INFO */}
            {ride && (
              <div
                style={{
                  marginTop: "25px",

                  padding: "18px",

                  borderRadius:
                    "14px",

                  background:
                    "#f9fafb",

                  border:
                    "1px solid #e5e7eb",
                }}
              >
                <h3
                  style={{
                    marginBottom:
                      "15px",

                    color:
                      "#111827",
                  }}
                >
                  Ride Details
                </h3>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    marginBottom:
                      "12px",
                  }}
                >
                  <span
                    style={{
                      color:
                        "#6b7280",
                    }}
                  >
                    Status
                  </span>

                  <span
                    style={{
                      fontWeight:
                        "600",

                      color:
                        "#2563eb",

                      textTransform:
                        "capitalize",
                    }}
                  >
                    {
                      ride.status
                    }
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",
                  }}
                >
                  <span
                    style={{
                      color:
                        "#6b7280",
                    }}
                  >
                    Driver Distance
                  </span>

                  <span
                    style={{
                      fontWeight:
                        "600",
                    }}
                  >
                    {distance} m
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MAP SECTION */}
          <div
            style={{
              background: "white",

              borderRadius: "20px",

              overflow: "hidden",

              boxShadow:
                "0 8px 25px rgba(0,0,0,0.06)",

              height: isMobile
                ? "450px"
                : "650px",

              width: "100%",
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