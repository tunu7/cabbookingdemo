import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";

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
  setDriverLocation,
}) {

  return (

    <MapContainer
      center={
        driverLocation ||
        customerLocation || [
          27.1,
          93.6,
        ]
      }

      zoom={13}

      style={{
        height: "500px",
        width: "100%",
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
        >

          <Popup>
            Customer Pickup
          </Popup>

        </Marker>
      )}

      {/* ROUTE */}
      {driverLocation &&
        customerLocation && (

        <Polyline
          positions={[
            driverLocation,
            customerLocation,
          ]}
        />
      )}

    </MapContainer>
  );
}

export default DriverMap;