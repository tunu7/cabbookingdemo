import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import {
  useEffect,
  useRef,
} from "react";

import "leaflet/dist/leaflet.css";

import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import "leaflet-routing-machine";

// PICKUP ICON
const pickupIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],
  });

// DESTINATION ICON
const destinationIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],
  });

// DRIVER ICON
const driverIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],
  });

// AUTO CENTER
function ChangeMapView({
  center,
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(
        center,
        14,
        {
          animate: true,
        }
      );
    }
  }, [center, map]);

  return null;
}

// ROUTING
function Routing({
  from,
  to,
  color,
}) {
  const map = useMap();

  const routingRef =
    useRef(null);

  useEffect(() => {
    if (!from || !to) {
      return;
    }

    // REMOVE OLD ROUTE
    if (
      routingRef.current
    ) {
      map.removeControl(
        routingRef.current
      );
    }

    // CREATE ROUTE
    routingRef.current =
      L.Routing.control({
        waypoints: [
          L.latLng(
            from.lat,
            from.lng
          ),

          L.latLng(
            to.lat,
            to.lng
          ),
        ],

        routeWhileDragging: false,

        addWaypoints: false,

        draggableWaypoints: false,

        fitSelectedRoutes: true,

        show: false,

        createMarker:
          () => null,

        lineOptions: {
          styles: [
            {
              color,
              weight: 6,
              opacity: 0.85,
            },
          ],
        },
      }).addTo(map);

    return () => {
      if (
        routingRef.current
      ) {
        map.removeControl(
          routingRef.current
        );
      }
    };
  }, [
    from,
    to,
    map,
    color,
  ]);

  return null;
}

// DESTINATION SELECTOR
function DestinationSelector({
  setDestinationLocation,
  setDestination,
}) {
  useMapEvents({
    async click(e) {
      const lat =
        e.latlng.lat;

      const lng =
        e.latlng.lng;

      setDestinationLocation({
        lat,
        lng,
      });

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
          setDestination(
            data.display_name
          );
        }
      } catch (error) {
        console.log(error);
      }
    },
  });

  return null;
}

function RideMap({
  customerLocation,
  destinationLocation,
  setDestinationLocation,
  setDestination,
  driverLocation,
}) {
  const center =
    driverLocation ||
    customerLocation || {
      lat: 27.1,
      lng: 93.6,
    };

  // LOADING
  if (!customerLocation) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          fontSize: "18px",

          fontWeight: "600",

          background:
            "#f9fafb",
        }}
      >
        Loading Map...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={
          true
        }
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* AUTO CENTER */}
        <ChangeMapView
          center={
            driverLocation ||
            customerLocation
          }
        />

        {/* CLICK DESTINATION */}
        <DestinationSelector
          setDestinationLocation={
            setDestinationLocation
          }
          setDestination={
            setDestination
          }
        />

        {/* TILE */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CUSTOMER */}
        {customerLocation && (
          <Marker
            position={
              customerLocation
            }
            icon={
              pickupIcon
            }
          >
            <Popup>
              Pickup
              Location
            </Popup>
          </Marker>
        )}

        {/* DESTINATION */}
        {destinationLocation && (
          <Marker
            position={
              destinationLocation
            }
            icon={
              destinationIcon
            }
          >
            <Popup>
              Destination
            </Popup>
          </Marker>
        )}

        {/* DRIVER */}
        {driverLocation && (
          <Marker
            position={
              driverLocation
            }
            icon={
              driverIcon
            }
          >
            <Popup>
              Driver Live
              Location
            </Popup>
          </Marker>
        )}

        {/* DRIVER → CUSTOMER */}
        {driverLocation &&
          customerLocation && (
            <Routing
              from={
                driverLocation
              }
              to={
                customerLocation
              }
              color="#2563eb"
            />
          )}

        {/* CUSTOMER → DESTINATION */}
        {customerLocation &&
          destinationLocation && (
            <Routing
              from={
                customerLocation
              }
              to={
                destinationLocation
              }
              color="#16a34a"
            />
          )}
      </MapContainer>
    </div>
  );
}

export default RideMap;