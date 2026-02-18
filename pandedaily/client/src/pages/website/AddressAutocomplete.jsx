import { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const AddressAutocomplete = ({ value, onChange, onLocationSelect, disabled }) => {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const timeoutRef = useRef(null)

  // Update query when value changes from parent (e.g., from map click)
  useEffect(() => {
    if (value !== query) {
      setQuery(value || '')
    }
  }, [value])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions from Photon API
  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Photon API - free, no API key required
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5&lang=en`,
      )

      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const data = await response.json()

      const formattedSuggestions = data.features
        .map((feature) => {
          const properties = feature.properties
          const coordinates = feature.geometry.coordinates

          // Build readable address
          const parts = []
          if (properties.name) parts.push(properties.name)
          if (properties.street) parts.push(properties.street)
          if (properties.city) parts.push(properties.city)
          if (properties.county) parts.push(properties.county)
          if (properties.state) parts.push(properties.state)
          if (properties.country) parts.push(properties.country)

          const fullAddress = parts.join(', ') || properties.display_name || ''

          return {
            id: properties.osm_id || `${coordinates[0]}-${coordinates[1]}`,
            fullAddress,
            lat: coordinates[1],
            lng: coordinates[0],
            name: properties.name || parts[0] || '',
          }
        })
        .filter((s) => s.fullAddress)

      setSuggestions(formattedSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(e)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (newValue.length >= 3) {
        fetchSuggestions(newValue)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.fullAddress)
    setShowSuggestions(false)
    setSuggestions([])

    // Update parent form
    onChange({ target: { name: 'address', value: suggestion.fullAddress } })

    // Update map with selected location
    if (onLocationSelect) {
      onLocationSelect({
        lat: suggestion.lat,
        lng: suggestion.lng,
        address: suggestion.fullAddress,
      })
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          className="w-full px-4 py-3 rounded-lg border-2 border-[#9C4A15] focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont]"
          placeholder="Type your address..."
          disabled={disabled}
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaSpinner className="animate-spin text-[#9C4A15]" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 cursor-pointer hover:bg-[#F5EFE7] transition-colors ${
                  index === selectedIndex ? 'bg-[#F5EFE7]' : ''
                } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-1 shrink-0" style={{ color: '#9C4A15' }} />
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: '#2A1803' }}>
                      {suggestion.name || suggestion.fullAddress.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-600">{suggestion.fullAddress}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      {showSuggestions && query.length >= 3 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center text-sm text-gray-500">
          No addresses found. Try being more specific or click on the map.
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
