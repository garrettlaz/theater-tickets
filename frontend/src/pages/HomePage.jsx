import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function HomePage() {
  const { data: shows, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/shows`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shows...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load shows. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Upcoming Shows</h1>

      {shows && shows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No shows scheduled at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <Link
              key={show.id}
              to={`/show/${show.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{show.title}</h2>
                <p className="text-gray-600 mb-4">
                  {format(new Date(show.date), 'EEEE, MMMM d, yyyy h:mm a')}
                </p>
                {show.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{show.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${(show.basePrice / 100).toFixed(2)}
                  </span>
                  {show._count && (
                    <span className="text-sm text-gray-600">
                      {show._count.tickets} tickets sold
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
