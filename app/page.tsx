'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import MapView from '@/Components/MapView'
import { MotorcycleShop } from '@/types/database'
import ShopList from '@/Components/ShopList'
import ShopSearch from '@/Components/ShopSearch'

export default function Home() {
  const [shops, setShops] = useState<MotorcycleShop[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedShop, setSelectedShop] = useState<MotorcycleShop | null>(null)

  const handleSearch = async (country: string, city: string) => {
    setLoading(true)
    try {
      let query = supabase.from('motorcycle_shops').select('*')
      if (country) query = query.ilike('country', `%${country}%`)
      if (city) query = query.ilike('city', `%${city}%`)
      const { data, error } = await query
      if (error) throw error
      setShops(data || [])
    } catch (error) {
      console.error('Error searching shops:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/motorcycle-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Find Motorcycle Repair Shops Across Europe
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Search thousands of verified motorcycle repair shops in EU countries.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
          <ShopSearch onSearch={handleSearch} loading={loading} />
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-4">
            <ShopList
              shops={shops}
              loading={loading}
              onShopSelect={setSelectedShop}
            />
          </div>

          <div className="lg:sticky lg:top-8 h-[600px] rounded-2xl overflow-hidden shadow-md">
            <MapView
              shops={shops}
              selectedShop={selectedShop}
              onShopSelect={setSelectedShop}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">
            Why Choose MotoFinder?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Easy Search',
                text: 'Find shops by country and city with our intuitive search.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                ),
              },
              {
                title: 'Interactive Maps',
                text: 'View shop locations on Google Maps for easy navigation.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                ),
              },
              {
                title: 'User Contributions',
                text: 'Register to add and manage repair shop listings.',
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                ),
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 text-blue-100 text-center py-6 mt-16">
        <p>&copy; {new Date().getFullYear()} MotoFinder. All rights reserved.</p>
      </footer>
    </div>
  )
}
