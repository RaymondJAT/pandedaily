import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { reverseGeocode } from '../../services/api'

// Fix default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const LocationMap = ({ onLocationSelect, selectedLocation }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const isInitializedRef = useRef(false)

  const defaultCenter = [14.5995, 120.9842]
  const defaultZoom = 13

  const isValidCoordinate = (lat, lng) => {
    const nLat = Number(lat)
    const nLng = Number(lng)
    return (
      !isNaN(nLat) &&
      !isNaN(nLng) &&
      isFinite(nLat) &&
      isFinite(nLng) &&
      nLat >= -90 &&
      nLat <= 90 &&
      nLng >= -180 &&
      nLng <= 180
    )
  }

  const updateMapLocation = useCallback((lat, lng) => {
    if (!mapInstanceRef.current || !isValidCoordinate(lat, lng)) return

    const numLat = Number(lat)
    const numLng = Number(lng)

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng([numLat, numLng])
    } else {
      markerRef.current = L.marker([numLat, numLng]).addTo(mapInstanceRef.current)
    }

    // Update map view
    mapInstanceRef.current.setView([numLat, numLng], 18, { animate: true })
  }, [])

  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const result = await reverseGeocode(lat, lng)
      onLocationSelect?.({
        lat: Number(result.lat),
        lng: Number(result.lng),
        address: result.address,
        placeId: result.placeId,
      })
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      // Fallback: use coordinates as address
      onLocationSelect?.({
        lat: Number(lat),
        lng: Number(lng),
        address: `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`,
      })
    }
  }

  const handleLocationUpdate = useCallback(
    (lat, lng) => {
      if (!isValidCoordinate(lat, lng)) {
        console.error('Invalid coordinates:', { lat, lng })
        return
      }

      const numLat = Number(lat)
      const numLng = Number(lng)

      // Update map immediately
      updateMapLocation(numLat, numLng)

      // Fetch address (this will trigger parent state update)
      fetchAddressFromCoordinates(numLat, numLng)
    },
    [updateMapLocation],
  )

  // Initialize map
  useEffect(() => {
    if (isInitializedRef.current) return
    if (!mapRef.current) return

    const map = L.map(mapRef.current).setView(defaultCenter, defaultZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      handleLocationUpdate(lat, lng)
    })

    mapInstanceRef.current = map
    isInitializedRef.current = true

    return () => {
      map.remove()
      mapInstanceRef.current = null
      isInitializedRef.current = false
    }
  }, [handleLocationUpdate])

  // Sync external changes
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return

    const { lat, lng } = selectedLocation
    if (isValidCoordinate(lat, lng)) {
      updateMapLocation(lat, lng)
    }
  }, [selectedLocation, updateMapLocation])

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: '400px', zIndex: 1 }} />

      <div className="absolute top-4 left-4 right-4 bg-white/90 p-3 rounded-lg shadow-md z-1000 text-sm pointer-events-none">
        <p className="font-medium" style={{ color: '#2A1803' }}>
          Click to set delivery location
        </p>
        {selectedLocation && isValidCoordinate(selectedLocation.lat, selectedLocation.lng) && (
          <p className="text-xs mt-1" style={{ color: '#9C4A15' }}>
            Selected: {Number(selectedLocation.lat).toFixed(6)},{' '}
            {Number(selectedLocation.lng).toFixed(6)}
          </p>
        )}
      </div>
    </div>
  )
}

export default LocationMap
