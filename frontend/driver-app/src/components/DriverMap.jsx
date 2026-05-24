import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// DRIVER ICON (BLUE)
const driverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

// CUSTOMER PICKUP ICON (GREEN)
const customerIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],
  });

// DESTINATION ICON (RED)
const destinationIcon =
  new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],
  });

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

      // FIXED
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
    customerLocation || [
      27.1,
      93.6,
    ];

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

        {/* CUSTOMER PICKUP */}
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

        {/* CUSTOMER DESTINATION */}
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

        {/* DRIVER TO CUSTOMER */}
        {driverLocation &&
          customerLocation && (
            <Polyline
              positions={[
                driverLocation,
                customerLocation,
              ]}
            />
          )}

        {/* CUSTOMER TO DESTINATION */}
        {customerLocation &&
          destinationLocation && (
            <Polyline
              positions={[
                customerLocation,
                destinationLocation,
              ]}
            />
          )}
      </MapContainer>
    </div>
  );
}

export default DriverMap;