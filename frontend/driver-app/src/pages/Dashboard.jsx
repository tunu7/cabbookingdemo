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
      {/* HEADER */}
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: "700",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Driver Panel
          </p>

          <h1
            style={{
              margin: "8px 0",
              fontSize: isMobile
                ? "34px"
                : "46px",
              fontWeight: "800",
              color: "#111827",
              lineHeight: 1.1,
            }}
          >
            Driver Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Manage rides and track customers
            live in realtime.
          </p>
        </div>

        {/* ONLINE BUTTON */}
        <button
          onClick={toggleOnlineStatus}
          style={{
            padding: "16px 28px",
            border: "none",
            borderRadius: "18px",
            background: online
              ? "#16a34a"
              : "#111827",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: online
              ? "0 10px 25px rgba(22,163,74,0.25)"
              : "0 10px 25px rgba(17,24,39,0.18)",
            transition: "0.25s",
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
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(4,1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        {/* STATUS */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 8px 24px rgba(15,23,42,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Driver Status
          </p>

          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "30px",
              fontWeight: "800",
              color: online
                ? "#16a34a"
                : "#dc2626",
            }}
          >
            {rideStatus}
          </h2>
        </div>

        {/* ETA */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 8px 24px rgba(15,23,42,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ETA to Pickup
          </p>

          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            {eta}
            <span
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginLeft: "5px",
              }}
            >
              min
            </span>
          </h2>
        </div>

        {/* DISTANCE */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 8px 24px rgba(15,23,42,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Trip Distance
          </p>

          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            {(
              tripDistance / 1000
            ).toFixed(1)}
            <span
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginLeft: "5px",
              }}
            >
              km
            </span>
          </h2>
        </div>

        {/* FARE */}
        <div
          style={{
            background: "#111827",
            borderRadius: "24px",
            padding: "24px",
            boxShadow:
              "0 10px 25px rgba(17,24,39,0.15)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Estimated Fare
          </p>

          <h2
            style={{
              margin: "12px 0 0",
              fontSize: "30px",
              fontWeight: "800",
              color: "#ffffff",
            }}
          >
            ₹{estimatedFare}
          </h2>
        </div>
      </div>

      {/* MAIN */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "420px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LEFT SIDEBAR */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* PENDING RIDES */}
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              borderRadius: "28px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Pending Rides
              </h2>

              <div
                style={{
                  background: "#111827",
                  color: "#ffffff",
                  borderRadius: "999px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {pendingRides.length}
              </div>
            </div>

            {pendingRides.length ===
              0 && (
              <div
                style={{
                  padding: "30px 20px",
                  textAlign: "center",
                  background: "#f9fafb",
                  borderRadius: "18px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                No ride requests available
              </div>
            )}

            {pendingRides.map(
              (ride) => (
                <div
                  key={ride._id}
                  style={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      "22px",
                    padding: "20px",
                    marginBottom:
                      "16px",
                    background:
                      "#ffffff",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <p
                      style={{
                        margin:
                          "0 0 10px",
                        fontSize:
                          "14px",
                        color:
                          "#6b7280",
                        fontWeight:
                          "600",
                      }}
                    >
                      Pickup
                    </p>

                    <div
                      style={{
                        fontWeight:
                          "700",
                        color:
                          "#111827",
                        fontSize:
                          "15px",
                      }}
                    >
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
                    </div>
                  </div>

                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <p
                      style={{
                        margin:
                          "0 0 10px",
                        fontSize:
                          "14px",
                        color:
                          "#6b7280",
                        fontWeight:
                          "600",
                      }}
                    >
                      Destination
                    </p>

                    <div
                      style={{
                        fontWeight:
                          "700",
                        color:
                          "#111827",
                        fontSize:
                          "15px",
                      }}
                    >
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
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
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
                          "14px",
                        border: "none",
                        borderRadius:
                          "14px",
                        background:
                          "#16a34a",
                        color:
                          "#ffffff",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
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
                          "14px",
                        border: "none",
                        borderRadius:
                          "14px",
                        background:
                          "#dc2626",
                        color:
                          "#ffffff",
                        fontWeight:
                          "700",
                        cursor:
                          "pointer",
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
                  "rgba(255,255,255,0.92)",
                backdropFilter:
                  "blur(10px)",
                borderRadius:
                  "28px",
                padding: "24px",
                border:
                  "1px solid #e5e7eb",
                boxShadow:
                  "0 10px 30px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom:
                    "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  Active Ride
                </h2>

                <div
                  style={{
                    background:
                      "#dcfce7",
                    color: "#166534",
                    padding:
                      "6px 12px",
                    borderRadius:
                      "999px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {rideStatus}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "14px",
                }}
              >
                <button
                  onClick={() =>
                    updateRideStatus(
                      "ARRIVING"
                    )
                  }
                  style={{
                    padding: "15px",
                    border: "none",
                    borderRadius:
                      "16px",
                    background:
                      "#111827",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Mark as Arriving
                </button>

                <button
                  onClick={() =>
                    updateRideStatus(
                      "STARTED"
                    )
                  }
                  style={{
                    padding: "15px",
                    border: "none",
                    borderRadius:
                      "16px",
                    background:
                      "#2563eb",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Start Trip
                </button>

                <button
                  onClick={() =>
                    updateRideStatus(
                      "COMPLETED"
                    )
                  }
                  style={{
                    padding: "15px",
                    border: "none",
                    borderRadius:
                      "16px",
                    background:
                      "#16a34a",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
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
              : "calc(100vh - 120px)",
            minHeight: "500px",
            borderRadius: "30px",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.08)",
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
); }

export default Dashboard;