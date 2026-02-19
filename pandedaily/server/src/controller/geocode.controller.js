const https = require('https')

/**
 * Reverse geocoding - Convert coordinates to address
 * Method: GET
 * @param { lat, lng } query
 * @returns {json}
 */
const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query

    if (!lat || !lng) {
      return res.status(400).json({
        message: 'Latitude and longitude are required',
      })
    }

    console.log('🔍 Reverse geocoding request for:', { lat, lng })

    // Create a promise-based HTTPS request (following your pattern)
    const geocodeResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'nominatim.openstreetmap.org',
        path: `/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        method: 'GET',
        headers: {
          'User-Agent': 'PandeDailyApp/1.0', // Required: Identify your application
          'Accept-Language': 'en',
        },
      }

      const req = https.get(options, (response) => {
        let data = ''

        response.on('data', (chunk) => {
          data += chunk
        })

        response.on('end', () => {
          try {
            const parsedData = JSON.parse(data)
            resolve(parsedData)
          } catch (e) {
            reject(new Error('Failed to parse geocoding response'))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.end()
    })

    console.log('✅ Reverse geocoding successful')
    return res.status(200).json(geocodeResult)
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error)
    return res.status(500).json({
      message: 'Error processing reverse geocoding request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

/**
 * Forward geocoding - Convert address to coordinates
 * Method: GET
 * @param { q } query - address to search
 * @returns {json}
 */
const searchGeocode = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        message: 'Address query is required',
      })
    }

    console.log('🔍 Geocoding request for address:', q)

    // Add delay to respect Nominatim's usage policy (max 1 request per second)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Encode the address for URL
    const encodedAddress = encodeURIComponent(q)

    // Create a promise-based HTTPS request (following your pattern)
    const geocodeResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'nominatim.openstreetmap.org',
        path: `/search?q=${encodedAddress}&format=json&limit=5&addressdetails=1&accept-language=en`,
        method: 'GET',
        headers: {
          'User-Agent': 'PandeDailyApp/1.0', // Required: Identify your application
          'Accept-Language': 'en',
        },
      }

      const req = https.get(options, (response) => {
        let data = ''

        response.on('data', (chunk) => {
          data += chunk
        })

        response.on('end', () => {
          try {
            const parsedData = JSON.parse(data)
            resolve(parsedData)
          } catch (e) {
            reject(new Error('Failed to parse geocoding response'))
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.end()
    })

    console.log(`✅ Found ${geocodeResult.length} results`)
    return res.status(200).json(geocodeResult)
  } catch (error) {
    console.error('❌ Geocoding error:', error)
    return res.status(500).json({
      message: 'Error processing geocoding request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  reverseGeocode,
  searchGeocode,
}
