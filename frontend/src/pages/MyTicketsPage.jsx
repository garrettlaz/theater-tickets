import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import QRCode from 'qrcode.react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function MyTicketsPage() {
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tickets/my-tickets`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load tickets.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Tickets</h1>

      {tickets && tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">You don't have any tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
            >
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-bold">{ticket.show.title}</h2>
                <p className="text-sm opacity-90">
                  {format(new Date(ticket.show.date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Seat</p>
                    <p className="text-2xl font-bold">
                      {ticket.seat.row}
                      {ticket.seat.number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">Price</p>
                    <p className="text-xl font-bold text-blue-600">
                      ${(ticket.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {ticket.checkedIn ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-4">
                    <p className="text-green-800 font-semibold">✓ Checked In</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center mb-4">
                    <p className="text-yellow-800 font-semibold">⏱ Not Checked In</p>
                  </div>
                )}

                {ticket.qrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-2 rounded border-2 border-gray-300">
                      <QRCode value={ticket.qrCodeUrl} size={150} />
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 text-center">
                  Purchase Date: {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
