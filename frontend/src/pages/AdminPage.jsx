import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('shows')

  const { data: shows, isLoading } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/shows`)
      return response.data
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('shows')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'shows'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Shows
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'reports'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'shows' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Shows</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  + Add Show
                </button>
              </div>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  {shows && shows.map((show) => (
                    <div
                      key={show.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <h3 className="text-lg font-semibold">{show.title}</h3>
                      <p className="text-gray-600">
                        {format(new Date(show.date), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-gray-600">Base Price: ${(show.basePrice / 100).toFixed(2)}</p>
                      <div className="mt-2 flex gap-2">
                        <button className="text-blue-600 hover:underline">Edit</button>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Sales Reports</h2>
              <p className="text-gray-600">Select a show to view detailed sales report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
