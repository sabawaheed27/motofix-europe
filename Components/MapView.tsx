'use client'

import { useEffect, useRef, useState } from 'react'
import type { MotorcycleShop } from '@/types/database'

interface MapViewProps {
  shops: MotorcycleShop[]
  selectedShop: MotorcycleShop | null
  onShopSelect: (shop: MotorcycleShop) => void
}

// Declare google maps types
declare global {
  interface Window {
    google: any
  }
}

export default function MapView({ shops, selectedShop, onShopSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 50.0, lng: 10.0 },
        zoom: 4,
      })

      infoWindowRef.current = new window.google.maps.InfoWindow()
      setMapLoaded(true)
    }

    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.defer = true
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null))
    markersRef.current = []

    if (shops.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    const validShops = shops.filter((shop: MotorcycleShop) => shop.latitude && shop.longitude)

    validShops.forEach((shop: MotorcycleShop) => {
      const position = {
        lat: shop.latitude!,
        lng: shop.longitude!,
      }

      // Create custom marker with better icon
      const marker = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: shop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: window.google.maps.Animation.DROP,
      })

      // Show name on hover
      marker.addListener('mouseover', () => {
        showInfoWindow(shop, marker)
      })

      // Keep info window open for a moment on mouseout
      marker.addListener('mouseout', () => {
        setTimeout(() => {
          if (selectedShop?.uuid !== shop.uuid) {
            infoWindowRef.current?.close()
          }
        }, 500)
      })

      // Select shop on click
      marker.addListener('click', () => {
        onShopSelect(shop)
        showInfoWindow(shop, marker)
      })

      markersRef.current.push(marker)
      bounds.extend(position)
    })

    if (validShops.length > 0) {
      googleMapRef.current.fitBounds(bounds)
      if (validShops.length === 1) {
        googleMapRef.current.setZoom(15)
      }
    }
  }, [shops, mapLoaded, onShopSelect])

  useEffect(() => {
    if (!selectedShop || !mapLoaded || !googleMapRef.current) return

    if (selectedShop.latitude && selectedShop.longitude) {
      const position = {
        lat: selectedShop.latitude,
        lng: selectedShop.longitude,
      }

      googleMapRef.current.setCenter(position)
      googleMapRef.current.setZoom(15)

      const marker = markersRef.current.find(m => {
        const pos = m.getPosition()
        return pos?.lat() === selectedShop.latitude && pos?.lng() === selectedShop.longitude
      })

      if (marker) {
        showInfoWindow(selectedShop, marker)
      }
    }
  }, [selectedShop, mapLoaded])

  const showInfoWindow = (shop: MotorcycleShop, marker: any) => {
    if (!infoWindowRef.current) return

    const content = `
      <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="display: flex; align-items: start; margin-bottom: 8px;">
          <svg style="width: 20px; height: 20px; color: #2563eb; margin-right: 8px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          <h3 style="font-weight: 700; margin: 0; color: #1e40af; font-size: 16px; line-height: 1.4;">${shop.name}</h3>
        </div>
        
        <div style="padding-left: 28px;">
          <p style="margin: 4px 0; font-size: 14px; color: #374151;">
            <strong>${shop.city}, ${shop.country}</strong>
          </p>
          
          ${shop.address ? `
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
              ${shop.address}
            </p>
          ` : ''}
          
          ${shop.rating ? `
            <div style="display: flex; align-items: center; margin-top: 8px; padding: 6px 0; border-top: 1px solid #e5e7eb;">
              <span style="color: #f59e0b; font-size: 16px; margin-right: 4px;">⭐</span>
              <span style="font-weight: 600; color: #111827; font-size: 14px;">${shop.rating.toFixed(1)}</span>
              ${shop.reviews_count ? `
                <span style="color: #6b7280; font-size: 13px; margin-left: 4px;">(${shop.reviews_count} reviews)</span>
              ` : ''}
            </div>
          ` : ''}
          
          <div style="display: flex; gap: 12px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            ${shop.phone ? `
              <a href="tel:${shop.phone}" 
                 style="display: inline-flex; align-items: center; color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500;"
                 onmouseover="this.style.color='#1e40af'"
                 onmouseout="this.style.color='#2563eb'">
                <svg style="width: 14px; height: 14px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Call
              </a>
            ` : ''}
            
            ${shop.website ? `
              <a href="${shop.website}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style="display: inline-flex; align-items: center; color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 500;"
                 onmouseover="this.style.color='#1e40af'"
                 onmouseout="this.style.color='#2563eb'">
                <svg style="width: 14px; height: 14px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                Website
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `

    infoWindowRef.current.setContent(content)
    infoWindowRef.current.open(googleMapRef.current, marker)
  }

  return (
    <div className="card h-full p-0 overflow-hidden">
      <div ref={mapRef} className="w-full h-full min-h-[600px]" />
    </div>
  )
}