import { useEffect, useState } from "react";

import API from "../api/axios";

import Navbar from "../components/Navbar";

import DriverMap from "../components/DriverMap";

import socket from "../socket/socket.js";

function Dashboard() {
  const [online, setOnline] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(
      window.innerWidth <= 900
    );

  const [
    driverLocation,
    setDriverLocationState,
  ] = useState(null);

  const [
    customerLocation,
    setCustomerLocation,
  ] = useState(null);

  const [
    destinationLocation,
    setDestinationLocation,
  ] = useState(null);

  const [rideStatus, setRideStatus] =
    useState("OFFLINE");

  const [pendingRides, setPendingRides] =
    useState([]);

  const [currentRide, setCurrentRide] =
    useState(null);

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

  // SOCKET CONNECT
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  // UPDATE DRIVER LOCATION
  const updateDriverLocation =
    async (lat, lng) => {
      try {
        const location = {
          lat: Number(lat),
          lng: Number(lng),
        };

        console.log(
          "UPDATING DRIVER:",
          location
        );

        setDriverLocationState(
          location
        );

        await API.post(
          "/location/update",
          location
        );
      } catch (error) {
        console.log(error);
      }
    };

  // LIVE GPS TRACKING
  useEffect(() => {
    if (!online) return;

    const watchId =
      navigator.geolocation.watchPosition(
        async (
          position
        ) => {
          const lat =
            position.coords
              .latitude;

          const lng =
            position.coords
              .longitude;

          await updateDriverLocation(
            lat,
            lng
          );
        },

        (error) => {
          console.log(error);
        },

        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [online]);

  // SOCKET NEW RIDE
  useEffect(() => {
    socket.on(
      "newRide",

      (ride) => {
        console.log(
          "NEW RIDE:",
          ride
        );

        setPendingRides(
          (prev) => {
            const exists =
              prev.find(
                (r) =>
                  r._id ===
                  ride._id
              );

            if (exists)
              return prev;

            return [
              ride,
              ...prev,
            ];
          }
        );
      }
    );

    return () => {
      socket.off(
        "newRide"
      );
    };
  }, []);

  // FETCH PENDING RIDES
  const fetchPendingRides =
    async () => {
      try {
        const res =
          await API.get(
            "/rides/pending"
          );

        console.log(
          "PENDING RIDES:",
          res.data
        );

        if (
          Array.isArray(
            res.data
          )
        ) {
          setPendingRides(
            res.data
          );
        } else {
          setPendingRides([]);
        }
      } catch (error) {
        console.log(error);

        setPendingRides([]);
      }
    };

  // TOGGLE ONLINE
  const toggleOnlineStatus =
    async () => {
      const newStatus =
        !online;

      setOnline(
        newStatus
      );

      setRideStatus(
        newStatus
          ? "ONLINE"
          : "OFFLINE"
      );

      if (newStatus) {
        await fetchPendingRides();
      } else {
        setPendingRides([]);

        setCurrentRide(
          null
        );

        setCustomerLocation(
          null
        );

        setDestinationLocation(
          null
        );
      }
    };

  // ACCEPT RIDE
  const acceptRide =
    async (rideId) => {
      try {
        const res =
          await API.post(
            `/rides/${rideId}/accept`
          );

        console.log(
          "ACCEPTED RIDE:",
          res.data
        );

        setCurrentRide(
          res.data
        );

        setCustomerLocation(
          res.data
            .pickupLocation
        );

        setDestinationLocation(
          res.data
            .destinationLocation
        );

        setPendingRides(
          (prev) =>
            prev.filter(
              (ride) =>
                ride._id !==
                rideId
            )
        );

        setRideStatus(
          res.data.status
        );

        alert(
          "Ride Accepted"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Accept Ride Failed"
        );
      }
    };

  // REJECT RIDE
  const rejectRide =
    async (rideId) => {
      try {
        await API.post(
          `/rides/${rideId}/reject`
        );

        setPendingRides(
          (prev) =>
            prev.filter(
              (ride) =>
                ride._id !==
                rideId
            )
        );

        alert(
          "Ride Rejected"
        );
      } catch (error) {
        console.log(error);
      }
    };

  // UPDATE RIDE STATUS
  const updateRideStatus =
    async (status) => {
      if (
        !currentRide?._id
      ) {
        alert(
          "No Active Ride"
        );

        return;
      }

      try {
        const res =
          await API.patch(
            `/rides/${currentRide._id}/status`,
            {
              status,
            }
          );

        console.log(
          "UPDATED STATUS:",
          res.data
        );

        setRideStatus(
          res.data.status
        );

        setCurrentRide(
          res.data
        );

        if (
          status ===
          "COMPLETED"
        ) {
          setCurrentRide(
            null
          );

          setCustomerLocation(
            null
          );

          setDestinationLocation(
            null
          );

          setRideStatus(
            "ONLINE"
          );
        }
      } catch (error) {
        console.log(error);
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
      (lat1 * Math.PI) /
      180;

    const φ2 =
      (lat2 * Math.PI) /
      180;

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

  // CUSTOMER DISTANCE
  const customerDistance =
    driverLocation &&
    customerLocation
      ? calculateDistance(
          driverLocation.lat,
          driverLocation.lng,
          customerLocation.lat,
          customerLocation.lng
        )
      : 0;

  // TRIP DISTANCE
  const tripDistance =
    customerLocation &&
    destinationLocation
      ? calculateDistance(
          customerLocation.lat,
          customerLocation.lng,
          destinationLocation.lat,
          destinationLocation.lng
        )
      : 0;

  // ETA
  const eta =
    customerDistance > 0
      ? Math.max(
          1,
          Math.round(
            customerDistance /
              250
          )
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
        {/* HEADER */}
        <div
          style={{
            marginBottom: "30px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile
                  ? "30px"
                  : "42px",
                fontWeight: "800",
                color: "#111827",
              }}
            >
              Driver Dashboard
            </h1>

            <p
              style={{
                color: "#6b7280",
              }}
            >
              Live realtime ride
              tracking.
            </p>
          </div>

          {/* ONLINE BUTTON */}
          <button
            onClick={
              toggleOnlineStatus
            }
            style={{
              padding:
                "15px 24px",
              border: "none",
              borderRadius:
                "16px",
              background:
                online
                  ? "#16a34a"
                  : "#111827",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {online
              ? "Go Offline"
              : "Go Online"}
          </button>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              isMobile
                ? "1fr"
                : "repeat(4,1fr)",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          {/* STATUS */}
          <div
            style={{
              background: "white",
              padding: "22px",
              borderRadius:
                "22px",
            }}
          >
            <div>
              Driver Status
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color:
                  online
                    ? "#16a34a"
                    : "#dc2626",
              }}
            >
              {rideStatus}
            </div>
          </div>

          {/* ETA */}
          <div
            style={{
              background: "white",
              padding: "22px",
              borderRadius:
                "22px",
            }}
          >
            <div>
              ETA to Pickup
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: "800",
              }}
            >
              {eta} min
            </div>
          </div>

          {/* DISTANCE */}
          <div
            style={{
              background: "white",
              padding: "22px",
              borderRadius:
                "22px",
            }}
          >
            <div>
              Trip Distance
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: "800",
              }}
            >
              {(
                tripDistance /
                1000
              ).toFixed(1)}{" "}
              km
            </div>
          </div>

          {/* FARE */}
          <div
            style={{
              background: "white",
              padding: "22px",
              borderRadius:
                "22px",
            }}
          >
            <div>
              Estimated Fare
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#16a34a",
              }}
            >
              ₹
              {
                estimatedFare
              }
            </div>
          </div>
        </div>

        {/* MAIN */}
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
          {/* LEFT */}
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "25px",
            }}
          >
            {/* PENDING RIDES */}
            <div
              style={{
                background: "white",
                borderRadius:
                  "24px",
                padding: "25px",
              }}
            >
              <h2>
                Pending Rides (
                {
                  pendingRides.length
                }
                )
              </h2>

              {pendingRides.length ===
                0 && (
                <p>
                  No Ride
                  Requests
                </p>
              )}

              {pendingRides.map(
                (ride) => (
                  <div
                    key={
                      ride._id
                    }
                    style={{
                      border:
                        "1px solid #eee",
                      borderRadius:
                        "18px",
                      padding:
                        "18px",
                      marginBottom:
                        "15px",
                    }}
                  >
                    <p>
                      Pickup:
                      {" "}
                      {
                        ride
                          .pickupLocation
                          ?.lat
                      }

                      ,

                      {" "}

                      {
                        ride
                          .pickupLocation
                          ?.lng
                      }
                    </p>

                    <p>
                      Destination:
                      {" "}
                      {
                        ride
                          .destinationLocation
                          ?.lat
                      }

                      ,

                      {" "}

                      {
                        ride
                          .destinationLocation
                          ?.lng
                      }
                    </p>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() =>
                          acceptRide(
                            ride._id
                          )
                        }
                        style={{
                          flex: 1,
                          padding:
                            "12px",
                          border:
                            "none",
                          borderRadius:
                            "12px",
                          background:
                            "#16a34a",
                          color:
                            "white",
                        }}
                      >
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          rejectRide(
                            ride._id
                          )
                        }
                        style={{
                          flex: 1,
                          padding:
                            "12px",
                          border:
                            "none",
                          borderRadius:
                            "12px",
                          background:
                            "#dc2626",
                          color:
                            "white",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* ACTIVE RIDE */}
            {currentRide && (
              <div
                style={{
                  background:
                    "white",
                  borderRadius:
                    "24px",
                  padding:
                    "25px",
                }}
              >
                <h2>
                  Active Ride
                </h2>

                <p>
                  Status:
                  {" "}
                  {
                    rideStatus
                  }
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "12px",
                    marginTop:
                      "20px",
                  }}
                >
                  <button
                    onClick={() =>
                      updateRideStatus(
                        "ARRIVING"
                      )
                    }
                  >
                    Arriving
                  </button>

                  <button
                    onClick={() =>
                      updateRideStatus(
                        "STARTED"
                      )
                    }
                  >
                    Start Trip
                  </button>

                  <button
                    onClick={() =>
                      updateRideStatus(
                        "COMPLETED"
                      )
                    }
                  >
                    Complete Trip
                  </button>
                </div>
              </div>
            )}
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
              background:
                "white",
            }}
          >
            <DriverMap
              driverLocation={
                driverLocation
              }
              customerLocation={
                customerLocation
              }
              destinationLocation={
                destinationLocation
              }
              setDriverLocation={
                updateDriverLocation
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;