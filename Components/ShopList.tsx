'use client'

import { MotorcycleShop } from '@/types/database'

interface ShopListProps {
  shops: MotorcycleShop[]
  loading: boolean
  onShopSelect: (shop: MotorcycleShop) => void
}

export default function ShopList({ shops, loading, onShopSelect }: ShopListProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600 text-lg">No repair shops found</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">
          Found {shops.length} shop{shops.length !== 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {shops.map((shop) => (
          <div
            key={shop.uuid}
            onClick={() => onShopSelect(shop)}
            className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <h4 className="text-lg font-semibold text-blue-600 mb-2">{shop.name}</h4>
            
            <div className="flex items-start text-gray-600 mb-2">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{shop.city}, {shop.country}</span>
            </div>

            {shop.address && (
              <div className="text-sm text-gray-600 mb-2 ml-7">{shop.address}</div>
            )}

            {shop.rating && (
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                {shop.reviews_count && (
                  <span className="text-sm text-gray-500 ml-2">({shop.reviews_count} reviews)</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-3">
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {shop.phone}
                </a>
              )}

              {shop.website && (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </a>
              )}
            </div>

            {shop.hours && (
              <div className="mt-3 text-sm text-gray-600 flex items-start">
                <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {shop.hours}
              </div>
            )}

            {shop.business_type && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                  {shop.business_type}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}