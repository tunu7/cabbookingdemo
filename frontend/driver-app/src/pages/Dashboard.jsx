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

  // UPDATE DRIVER LOCATION
  const updateDriverLocation =
    async (lat, lng) => {
      try {
        const location = {
          lat,
          lng,
        };

        setDriverLocationState(
          location
        );

        await API.post(
          "/location/update",
          location
        );

        console.log(
          "Driver Location Updated"
        );
      } catch (error) {
        console.log(error);
      }
    };

  // SOCKET LISTENER
  useEffect(() => {
    socket.on(
      "newRide",

      (ride) => {
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

  // FETCH RIDES
  const fetchPendingRides =
    async () => {
      try {
        const res =
          await API.get(
            "/rides/pending"
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

  // TOGGLE ONLINE STATUS
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

        setCurrentRide(
          res.data
        );

        setCustomerLocation(
          res.data.pickupLocation
        );

        setDestinationLocation(
          res.data.destinationLocation
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

  // UPDATE STATUS
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

        setRideStatus(
          res.data.status
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
                  ? "28px"
                  : "36px",

                fontWeight: "700",

                color: "#111827",

                marginBottom: "8px",
              }}
            >
              Driver Dashboard
            </h1>

            <p
              style={{
                color: "#6b7280",

                fontSize: isMobile
                  ? "14px"
                  : "16px",
              }}
            >
              Manage ride requests
              and track passengers
              live in real-time.
            </p>
          </div>

          {/* ONLINE BUTTON */}
          <button
            onClick={
              toggleOnlineStatus
            }
            style={{
              width: isMobile
                ? "100%"
                : "auto",

              padding:
                "14px 22px",

              border: "none",

              borderRadius:
                "12px",

              background:
                online
                  ? "#16a34a"
                  : "#111827",

              color: "white",

              fontWeight: "600",

              cursor: "pointer",

              fontSize: "15px",
            }}
          >
            {online
              ? "Go Offline"
              : "Go Online"}
          </button>
        </div>

        {/* STATUS CARD */}
        <div
          style={{
            background: "white",

            padding: "18px 22px",

            borderRadius: "18px",

            marginBottom: "25px",

            boxShadow:
              "0 8px 25px rgba(0,0,0,0.05)",

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,

                color: "#6b7280",

                fontSize: "15px",
              }}
            >
              Current Status
            </h3>

            <h2
              style={{
                marginTop: "5px",

                color:
                  rideStatus ===
                  "OFFLINE"
                    ? "#dc2626"
                    : "#16a34a",
              }}
            >
              {rideStatus}
            </h2>
          </div>

          <div
            style={{
              width: "14px",

              height: "14px",

              borderRadius:
                "50%",

              background:
                online
                  ? "#16a34a"
                  : "#dc2626",
            }}
          />
        </div>

        {/* MAIN GRID */}
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
          {/* LEFT SIDE */}
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
                  "20px",

                padding: isMobile
                  ? "18px"
                  : "25px",

                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  marginBottom:
                    "20px",

                  color:
                    "#111827",
                }}
              >
                Pending Rides
              </h2>

              {pendingRides.length ===
                0 && (
                <p
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  No Ride Requests
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
                        "1px solid #e5e7eb",

                      borderRadius:
                        "16px",

                      padding:
                        "18px",

                      marginBottom:
                        "18px",

                      background:
                        "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        marginBottom:
                          "12px",

                        fontSize:
                          "14px",

                        wordBreak:
                          "break-word",
                      }}
                    >
                      <p>
                        <strong>
                          Pickup:
                        </strong>

                        <br />

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
                        <strong>
                          Destination:
                        </strong>

                        <br />

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
                    </div>

                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          isMobile
                            ? "column"
                            : "row",

                        gap: "10px",
                      }}
                    >
                      {/* ACCEPT */}
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
                            "10px",

                          background:
                            "#16a34a",

                          color:
                            "white",

                          fontWeight:
                            "600",

                          cursor:
                            "pointer",
                        }}
                      >
                        Accept
                      </button>

                      {/* REJECT */}
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
                            "10px",

                          background:
                            "#dc2626",

                          color:
                            "white",

                          fontWeight:
                            "600",

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
                    "white",

                  borderRadius:
                    "20px",

                  padding:
                    isMobile
                      ? "18px"
                      : "25px",

                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.05)",
                }}
              >
                <h2
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >
                  Active Ride
                </h2>

                <p>
                  <strong>
                    Pickup:
                  </strong>

                  <br />

                  {
                    currentRide
                      ?.pickupLocation
                      ?.lat
                  }

                  ,

                  {" "}

                  {
                    currentRide
                      ?.pickupLocation
                      ?.lng
                  }
                </p>

                <p>
                  <strong>
                    Destination:
                  </strong>

                  <br />

                  {
                    currentRide
                      ?.destinationLocation
                      ?.lat
                  }

                  ,

                  {" "}

                  {
                    currentRide
                      ?.destinationLocation
                      ?.lng
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
                    style={{
                      padding:
                        "12px",

                      border:
                        "none",

                      borderRadius:
                        "10px",

                      background:
                        "#2563eb",

                      color:
                        "white",

                      fontWeight:
                        "600",

                      cursor:
                        "pointer",
                    }}
                  >
                    Arriving
                  </button>

                  <button
                    onClick={() =>
                      updateRideStatus(
                        "STARTED"
                      )
                    }
                    style={{
                      padding:
                        "12px",

                      border:
                        "none",

                      borderRadius:
                        "10px",

                      background:
                        "#111827",

                      color:
                        "white",

                      fontWeight:
                        "600",

                      cursor:
                        "pointer",
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
                      padding:
                        "12px",

                      border:
                        "none",

                      borderRadius:
                        "10px",

                      background:
                        "#16a34a",

                      color:
                        "white",

                      fontWeight:
                        "600",

                      cursor:
                        "pointer",
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
              background: "white",

              borderRadius:
                "20px",

              overflow: "hidden",

              height: isMobile
                ? "450px"
                : "750px",

              width: "100%",

              boxShadow:
                "0 8px 25px rgba(0,0,0,0.05)",
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