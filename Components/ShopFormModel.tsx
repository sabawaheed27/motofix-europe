'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MotorcycleShop } from '@/types/database'

interface ShopFormModalProps {
  shop?: MotorcycleShop | null
  onClose: () => void
  onSaved: () => void
}

// A type for our form state, where all values are strings for the input elements.
type ShopFormData = {
  name: string | null
  country: string
  city: string
  address: string
  phone: string
  website: string
  business_type: string
  hours: string
  rating: string
  reviews_count: string
  latitude: string
  longitude: string
  place_id: string
}

// Define the keys for the form data statically to avoid instantiating the component.
const initialFormData: ShopFormData = {
  name: null,
  country: '',
  city: '',
  address: '',
  phone: '',
  website: '',
  business_type: '',
  hours: '',
  rating: '',
  reviews_count: '',
  latitude: '',
  longitude: '',
  place_id: '',
}

// Helper to create initial form data from a shop object or as empty strings.
const createInitialFormData = (shop: MotorcycleShop | null | undefined): ShopFormData => {
  const initialData: Partial<ShopFormData> = {};
  const shopKeys = Object.keys(initialFormData) as (keyof ShopFormData)[];

  shopKeys.forEach(key => {
    const value = shop?.[key as keyof MotorcycleShop];
    initialData[key] = value ? String(value) : '';
  });

  return initialData as ShopFormData;
}

// Define more specific types for database payloads
type ShopUpdatePayload = Omit<MotorcycleShop, 'id' | 'scraped_at' | 'created_at' | 'created_by' | 'updated_at'>;
type ShopInsertPayload = Omit<MotorcycleShop, 'id' | 'scraped_at' | 'created_at' | 'updated_at'>;

export default function ShopFormModal({ shop, onClose, onSaved }: ShopFormModalProps) {
  const [formData, setFormData] = useState<ShopFormData>(createInitialFormData(shop));
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Prepare common data, converting strings to numbers or null where appropriate.
      const commonShopData = {
        name: formData.name || '',
        country: formData.country,
        city: formData.city,
        address: formData.address || null,
        phone: formData.phone || null,
        website: formData.website || null,
        business_type: formData.business_type as MotorcycleShop['business_type'] || null,
        hours: formData.hours || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviews_count: formData.reviews_count ? parseInt(formData.reviews_count) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        place_id: formData.place_id || null,
      }

      if (shop) {
        // Update existing shop
        const shopData: ShopUpdatePayload = commonShopData;
        const { error: updateError } = await supabase
          .from('motorcycle_shops')
          .update(shopData)
          .eq('id', shop.id)

        if (updateError) throw updateError
      } else {
        // Create new shop
        const shopData: ShopInsertPayload = {
          ...commonShopData,
          created_by: user.id
        };
        const { error: insertError } = await supabase
          .from('motorcycle_shops')
          .insert(shopData)

        if (insertError) throw insertError
      }

      onSaved()
    } catch (error: any) {
      setError(error.message || 'Failed to save shop')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">
            {shop ? 'Edit' : 'Add'} Motorcycle Repair Shop
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Business Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select type</option>
                    <option value="Repair Shop">Repair Shop</option>
                    <option value="Dealership">Dealership</option>
                    <option value="Parts Supplier">Parts Supplier</option>
                    <option value="Custom Shop">Custom Shop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Mon-Fri: 9AM-6PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Reviews
                  </label>
                  <input
                    type="number"
                    name="reviews_count"
                    value={formData.reviews_count}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Coordinates */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Location Coordinates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="input"
                  step="any"
                  placeholder="e.g., 52.520008"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="input"
                  step="any"
                  placeholder="e.g., 13.404954"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Place ID
              </label>
              <input
                type="text"
                name="place_id"
                value={formData.place_id}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}