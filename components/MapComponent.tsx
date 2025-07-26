'use client'

import { useEffect, useRef, useState } from 'react'

// Declare global google for TypeScript
declare global {
  interface Window {
    google: typeof google
    googleMapsApiLoading?: boolean
  }
}

interface Props {
  title: string
  center?: { lat: number; lng: number }
  zoom?: number
}

// Global flag to track if we're already loading the API
let isGoogleMapsLoading = false

export default function MapComponent({ 
  title, 
  center = { lat: 45.56272007910113, lng: 18.67411281569081 },
  zoom = 13 
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [isApiReady, setIsApiReady] = useState(false)

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return

      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      // Add a marker
      new window.google.maps.Marker({
        position: center,
        map,
        title: 'Osijek, Croatia',
        animation: window.google.maps.Animation.DROP,
      })

      mapInstanceRef.current = map
    }

    const loadGoogleMapsApi = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
          resolve()
          return
        }

        // Check if already loading
        if (isGoogleMapsLoading) {
          // Wait for the existing load to complete
          const checkLoaded = () => {
            if (window.google && window.google.maps) {
              resolve()
            } else {
              setTimeout(checkLoaded, 100)
            }
          }
          checkLoaded()
          return
        }

        // Check if script already exists in DOM
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          // Script exists but Google Maps might not be ready yet
          const checkLoaded = () => {
            if (window.google && window.google.maps) {
              resolve()
            } else {
              setTimeout(checkLoaded, 100)
            }
          }
          checkLoaded()
          return
        }

        // Mark as loading
        isGoogleMapsLoading = true

        // Create and load the script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          isGoogleMapsLoading = false
          resolve()
        }
        
        script.onerror = () => {
          isGoogleMapsLoading = false
          reject(new Error('Failed to load Google Maps API'))
        }

        document.head.appendChild(script)
      })
    }

    // Load the API and then initialize the map
    loadGoogleMapsApi()
      .then(() => {
        setIsApiReady(true)
        initMap()
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error)
      })

  }, []) // Remove dependencies to prevent re-loading

  // Re-initialize map when center or zoom changes (but don't reload API)
  useEffect(() => {
    if (isApiReady && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center)
      mapInstanceRef.current.setZoom(zoom)
    }
  }, [center.lat, center.lng, zoom, isApiReady])

  return (
    <section className="pt-12 my-24 mx-4 md:mx-24 lg:mx-36 xl:mx-60">
      <h1 className="font-serif text-[30px] lg:text-[36px] my-[20px] text-center">
        {title}
      </h1>

      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
        {!isApiReady && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-600">Loading map...</div>
          </div>
        )}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ display: isApiReady ? 'block' : 'none' }}
          role="application"
          aria-label="Interactive map"
        />
      </div>
    </section>
  )
}