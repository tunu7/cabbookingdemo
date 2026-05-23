import { useEffect, useState } from "react";

import API from "../utils/axios";

import Navbar from "../components/Navbar";

import RideMap from "../components/RideMap";

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

          // REVERSE GEOCODE
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

          // FETCH DRIVER LOCATION
          const locationRes =
            await API.get(
              `/rides/${ride._id}/driver-location`
            );

          if (
            locationRes.data?.location
          ) {

            setDriverLocation(
              locationRes.data.location
            );
          }

          // FETCH RIDE STATUS
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

    // INITIAL FETCH
    fetchRideData();

    // LIVE POLLING
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

  // DRIVER DISTANCE
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

        // PICKUP COORDINATES
        const pickupCoords =
          await getCoordinates(
            pickup
          );

        // DESTINATION COORDINATES
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

          return;
        }

        setPickupLocation(
          pickupCoords
        );

        setDestinationLocation(
          destinationCoords
        );

        // CREATE RIDE
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
          Customer Dashboard
        </h1>

        {/* PICKUP */}
        <div
          style={{
            marginBottom:
              "15px",
          }}
        >

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
              width: "350px",
              padding: "10px",
            }}
          />

        </div>

        {/* DESTINATION */}
        <div
          style={{
            marginBottom:
              "20px",
          }}
        >

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
              width: "350px",
              padding: "10px",
            }}
          />

        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={
            bookRide
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

          Book Ride

        </button>

        {/* RIDE INFO */}
        {ride && (

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >

            <h3>
              Ride Status:
              {" "}
              {
                ride.status
              }
            </h3>

            <h3>
              Driver Distance:
              {" "}
              {distance} m
            </h3>

          </div>
        )}

        {/* MAP */}
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
  );
}

export default Dashboard;