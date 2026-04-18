/**
 * Geolocation service for getting device location
 * Handles browser geolocation API with error handling
 */

/**
 * Gets the current device location using browser geolocation API
 * @returns {Promise<{lat: number, lon: number}>} Promise resolving to coordinates
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}
