import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// GREEN PICKUP ICON
const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

// RED DESTINATION ICON
const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

// BLUE DRIVER ICON
const driverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

// AUTO CENTER MAP
function ChangeMapView({ center }) {
  const map = useMap();

  map.setView(center);

  return null;
}

// CLICK TO SELECT DESTINATION
function DestinationSelector({
  setDestinationLocation,
  setDestination,
}) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;

      const lng = e.latlng.lng;

      setDestinationLocation({
        lat,
        lng,
      });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();

        if (data?.display_name) {
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
  if (!customerLocation) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "600",
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
        center={customerLocation}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
        }}
      >
        <ChangeMapView
          center={customerLocation}
        />

        <DestinationSelector
          setDestinationLocation={
            setDestinationLocation
          }
          setDestination={
            setDestination
          }
        />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CUSTOMER */}
        <Marker
          position={customerLocation}
          icon={pickupIcon}
        >
          <Popup>
            Pickup Location
          </Popup>
        </Marker>

        {/* DESTINATION */}
        {destinationLocation && (
          <Marker
            position={
              destinationLocation
            }
            icon={destinationIcon}
          >
            <Popup>
              Destination
            </Popup>
          </Marker>
        )}

        {/* DRIVER */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={driverIcon}
          >
            <Popup>
              Driver Location
            </Popup>
          </Marker>
        )}

        {/* DRIVER TO CUSTOMER */}
        {driverLocation && (
          <Polyline
            positions={[
              driverLocation,
              customerLocation,
            ]}
          />
        )}

        {/* CUSTOMER TO DESTINATION */}
        {destinationLocation && (
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

export default RideMap;