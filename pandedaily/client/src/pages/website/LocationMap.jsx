import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
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

  // Default center (Philippines)
  const defaultCenter = [14.5995, 120.9842] // Manila
  const defaultZoom = 6

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      console.log('Initializing map...')
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, defaultZoom)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      // Add click event to map
      mapInstanceRef.current.on('click', onMapClick)
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Handle map click
  const onMapClick = (e) => {
    const { lat, lng } = e.latlng
    console.log('Map clicked:', lat, lng)

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
    }

    // ZOOM IN - Set view with zoom level 18
    mapInstanceRef.current.setView([lat, lng], 18, { animate: true })

    // Get address from coordinates (reverse geocoding)
    fetchAddressFromCoordinates(lat, lng)
  }

  // Reverse geocoding using Nominatim (free)
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PandeDailyApp/1.0',
          },
        },
      )

      if (!response.ok) throw new Error('Failed to fetch address')

      const data = await response.json()

      if (data.display_name && onLocationSelect) {
        onLocationSelect({
          lat,
          lng,
          address: data.display_name,
          placeId: data.place_id,
        })
      } else {
        // Fallback if no address found
        onLocationSelect({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        })
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback with coordinates only
      onLocationSelect({
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      })
    }
  }

  // Update marker when selectedLocation changes from parent (e.g., from autocomplete)
  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng && mapInstanceRef.current) {
      const { lat, lng } = selectedLocation
      console.log('Selected location changed:', lat, lng)

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
      }

      // ZOOM IN - Always zoom to level 18 when location is selected
      mapInstanceRef.current.setView([lat, lng], 18, { animate: true })

      // Optional: Add a small delay and then try flyTo for smoother animation
      setTimeout(() => {
        if (mapInstanceRef.current) {
          // This will create a smooth animation after the initial zoom
          mapInstanceRef.current.flyTo([lat, lng], 18, {
            animate: true,
            duration: 1,
          })
        }
      }, 100)
    }
  }, [selectedLocation])

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: '400px' }} />

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md z-1000 text-sm">
        <p className="font-medium" style={{ color: '#2A1803' }}>
          Click anywhere on the map to set your delivery location
        </p>
        {selectedLocation?.lat && selectedLocation?.lng && (
          <p className="text-xs mt-1" style={{ color: '#9C4A15' }}>
            Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        )}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs shadow-md z-1000">
        © OpenStreetMap contributors
      </div>
    </div>
  )
}

export default LocationMap
