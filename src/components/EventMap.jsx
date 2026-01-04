import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useButtonAnimation } from '../hooks/useButtonAnimation'
import './EventMap.css'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function EventMap({ address, venue, coordinates }) {
  const mapRef = useRef(null)
  const handleButtonClick = useButtonAnimation()

  const defaultCoordinates = [14.5995, 120.9842]
  const mapCenter = coordinates?.lat && coordinates?.lng
    ? [coordinates.lat, coordinates.lng]
    : defaultCoordinates
  const mapsQuery = coordinates?.lat && coordinates?.lng
    ? `${coordinates.lat},${coordinates.lng}`
    : address

  return (
    <div className="event-map-container">
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={mapCenter}>
          <Popup>
            <strong>{venue}</strong><br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
      <div className="map-actions">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          onClick={(e) => {
            handleButtonClick(e)
          }}
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}

export default EventMap

