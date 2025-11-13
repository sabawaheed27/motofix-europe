
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ShopSearchProps {
  onSearch: (country: string, city: string) => void
  loading: boolean
}

export default function ShopSearch({ onSearch, loading }: ShopSearchProps) {
  const [countries, setCountries] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      loadCities(selectedCountry)
    } else {
      setCities([])
      setSelectedCity('')
    }
  }, [selectedCountry])

  const loadCountries = async () => {
    const { data, error } = await supabase
      .from('motorcycle_shops')
      .select('country')
      .order('country')

    if (error) {
      console.error('Error loading countries:', error)
      return
    }

    if (data) {
      console.log('Countries data:', data)
      const uniqueCountries = Array.from(
        new Set(data.map((d: any) => d.country).filter(Boolean))
      )
      console.log('Unique countries:', uniqueCountries)
      setCountries(uniqueCountries)
    }
  }

  const loadCities = async (country: string) => {
    const { data, error } = await supabase
      .from('motorcycle_shops')
      .select('city')
      .eq('country', country)
      .order('city')

    if (error) {
      console.error('Error loading cities:', error)
      return
    }

    if (data) {
      console.log('Cities data:', data)
      const uniqueCities = Array.from(new Set(data.map((d: any) => d.city).filter(Boolean)))
      console.log('Unique cities:', uniqueCities)
      setCities(uniqueCities)
    }
  }


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(selectedCountry, selectedCity)
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Search Motorcycle Shops</h3>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input"
            disabled={!selectedCountry}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  )
}