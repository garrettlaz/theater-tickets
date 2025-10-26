import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import SeatMap from '../components/SeatMap'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export default function ShowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [selectedSeats, setSelectedSeats] = useState([])

  const { data: show, isLoading } = useQuery({
    queryKey: ['show', id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/shows/${id}`)
      return response.data
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Please login to continue')
      }

      const response = await axios.post(
        `${API_URL}/stripe/create-checkout-session`,
        {
          showId: id,
          seatIds: selectedSeats,
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url
    },
    onError: async (error) => {
      if (error.message === 'Please login to continue') {
        // Show login modal or redirect
        const email = prompt('Please login to continue\nEnter your email:')
        const password = prompt('Enter your password:')
        if (email && password) {
          const result = await login(email, password)
          if (result.success) {
            // Retry checkout
            checkoutMutation.mutate()
          }
        }
      } else {
        alert('Failed to create checkout session. Please try again.')
      }
    },
  })

  const handleSeatSelect = (seat) => {
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seat.id))
    } else {
      setSelectedSeats([...selectedSeats, seat.id])
    }
  }

  const handleCheckout = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }
    checkoutMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Show not found</p>
      </div>
    )
  }

  const totalPrice = selectedSeats.length * show.basePrice

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{show.title}</h1>
        <p className="text-gray-600 text-lg">
          {format(new Date(show.date), 'EEEE, MMMM d, yyyy h:mm a')}
        </p>
        {show.description && (
          <p className="text-gray-600 mt-4 max-w-2xl">{show.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SeatMap
            seats={show.seats}
            onSeatSelect={handleSeatSelect}
            selectedSeats={selectedSeats}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="mb-4">
              <p className="text-gray-600">Selected Seats: {selectedSeats.length}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${(totalPrice / 100).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selectedSeats.length === 0 || checkoutMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Checkout'}
            </button>

            {selectedSeats.length > 0 && !isAuthenticated && (
              <p className="text-sm text-orange-600 mt-2">
                You'll need to login to complete your purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
