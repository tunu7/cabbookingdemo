import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import "leaflet-routing-machine";

// DRIVER ICON (BLUE)
const driverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [28, 45],

  iconAnchor: [14, 45],
});

// CUSTOMER PICKUP ICON (GREEN)
const customerIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [28, 45],

    iconAnchor: [14, 45],
  });

// DESTINATION ICON (RED)
const destinationIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [28, 45],

    iconAnchor: [14, 45],
  });

// AUTO CENTER MAP
function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.setView(center, 13, {
      animate: true,
    });
  }, [center, map]);

  return null;
}

// ROAD ROUTING
function Routing({
  from,
  to,
  color,
}) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routingControl =
      L.Routing.control({
        waypoints: [
          L.latLng(from.lat, from.lng),
          L.latLng(to.lat, to.lng),
        ],

        routeWhileDragging: false,

        addWaypoints: false,

        draggableWaypoints: false,

        fitSelectedRoutes: false,

        show: false,

        createMarker: () => null,

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
      map.removeControl(
        routingControl
      );
    };
  }, [from, to, map, color]);

  return null;
}

// CLICK TO MOVE DRIVER
function DriverLocationSelector({
  setDriverLocation,
}) {
  useMapEvents({
    click(e) {
      const lat =
        e.latlng.lat;

      const lng =
        e.latlng.lng;

      setDriverLocation(
        lat,
        lng
      );
    },
  });

  return null;
}

function DriverMap({
  driverLocation,
  customerLocation,
  destinationLocation,
  setDriverLocation,
}) {
  const center =
    driverLocation ||
    customerLocation || {
      lat: 27.1,
      lng: 93.6,
    };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
        }}
      >
        <ChangeMapView
          center={center}
        />

        {/* MAP TILE */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CLICK TO MOVE DRIVER */}
        <DriverLocationSelector
          setDriverLocation={
            setDriverLocation
          }
        />

        {/* DRIVER */}
        {driverLocation && (
          <Marker
            position={
              driverLocation
            }
            icon={driverIcon}
          >
            <Popup>
              Driver Location
            </Popup>
          </Marker>
        )}

        {/* CUSTOMER */}
        {customerLocation && (
          <Marker
            position={
              customerLocation
            }
            icon={customerIcon}
          >
            <Popup>
              Customer Pickup
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
              Customer Destination
            </Popup>
          </Marker>
        )}

        {/* DRIVER → CUSTOMER ROAD */}
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

        {/* CUSTOMER → DESTINATION ROAD */}
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

export default DriverMap;