import { useEffect, useState } from "react";

import API from "../api/axios";

import Navbar from "../components/Navbar";

import DriverMap from "../components/DriverMap";

import socket from "../socket/socket.js";

function Dashboard() {

  const [online, setOnline] =
    useState(false);

  const [driverLocation, setDriverLocationState] =
    useState(null);

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [rideStatus, setRideStatus] =
    useState("OFFLINE");

  const [pendingRides, setPendingRides] =
    useState([]);

  const [currentRide, setCurrentRide] =
    useState(null);

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

        // SEND LOCATION TO BACKEND
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

            // PREVENT DUPLICATES
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

        console.log(
  "Fetch rides error:",
  error.response?.data ||
  error.message
);

        setPendingRides([]);
      }
    };

  // FETCH ONCE WHEN ONLINE


  // ONLINE / OFFLINE
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

    // FETCH RIDES WHEN ONLINE
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

        // CUSTOMER LOCATION
        setCustomerLocation(
          res.data.pickupLocation
        );

        // REMOVE FROM PENDING
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

        // REMOVE FROM UI
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

        setRideStatus(
          res.data.status
        );

        // CLEAR AFTER COMPLETE
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

          setRideStatus(
            "ONLINE"
          );
        }

      } catch (error) {

        console.log(error);
      }
    };

  return (

    <div>

      <Navbar />

      <div
        style={{
          padding: "20px",
        }}
      >

        <h1>
          Driver Dashboard
        </h1>

        {/* ONLINE BUTTON */}
        <button
          onClick={
            toggleOnlineStatus
          }
          style={{
            padding:
              "10px 20px",

            cursor:
              "pointer",

            marginBottom:
              "20px",
          }}
        >

          {online
            ? "Go Offline"
            : "Go Online"}

        </button>

        <h3>
          Status:
          {" "}
          {rideStatus}
        </h3>

        {/* PENDING RIDES */}
        <h2>
          Pending Rides
        </h2>

        {pendingRides.length ===
          0 && (
          <p>
            No Ride Requests
          </p>
        )}

        {pendingRides.map(
          (ride) => (

            <div
              key={ride._id}
              style={{
                border:
                  "1px solid gray",

                padding:
                  "15px",

                marginBottom:
                  "15px",

                borderRadius:
                  "10px",
              }}
            >

              <p>
                <strong>
                  Pickup:
                </strong>
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
                <strong>
                  Destination:
                </strong>
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

              {/* ACCEPT */}
              <button
                onClick={() =>
                  acceptRide(
                    ride._id
                  )
                }
                style={{
                  padding:
                    "8px 15px",

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
                  padding:
                    "8px 15px",

                  marginLeft:
                    "10px",

                  cursor:
                    "pointer",
                }}
              >
                Reject
              </button>

            </div>
          )
        )}

        {/* ACTIVE RIDE */}
        {currentRide && (

          <div
            style={{
              marginTop:
                "20px",
            }}
          >

            <h2>
              Active Ride
            </h2>

            <p>
              <strong>
                Pickup:
              </strong>
              {" "}
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
              {" "}
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

                gap: "10px",

                marginTop:
                  "10px",
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

        {/* MAP */}
        <div
          style={{
            marginTop:
              "30px",
          }}
        >

          <DriverMap
            driverLocation={
              driverLocation
            }

            customerLocation={
              customerLocation
            }

            setDriverLocation={
              updateDriverLocation
            }
          />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;