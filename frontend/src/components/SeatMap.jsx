import { useState, useMemo } from 'react'

export default function SeatMap({ seats, onSeatSelect, selectedSeats = [], disabled = false }) {
  const [hoveredSeat, setHoveredSeat] = useState(null)

  // Group seats by row
  const seatsByRow = useMemo(() => {
    return seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = []
      }
      acc[seat.row].push(seat)
      return acc
    }, {})
  }, [seats])

  const getSeatColor = (seat) => {
    if (selectedSeats.includes(seat.id)) return 'bg-blue-600'
    if (seat.status === 'SOLD') return 'bg-gray-400'
    if (seat.status === 'BLOCKED') return 'bg-red-400'
    if (seat.status === 'RESERVED') return 'bg-yellow-400'
    if (hoveredSeat === seat.id) return 'bg-blue-400'
    return 'bg-green-500'
  }

  const getSeatClasses = (seat) => {
    const base =
      'w-8 h-8 m-1 rounded text-xs font-semibold cursor-pointer flex items-center justify-center transition-colors'
    const color = getSeatColor(seat)
    const disabledClass = seat.status !== 'AVAILABLE' || disabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg'

    return `${base} ${color} ${disabledClass}`
  }

  const handleSeatClick = (seat) => {
    if (seat.status === 'AVAILABLE' && !disabled) {
      onSeatSelect(seat)
    }
  }

  const sortedRows = Object.keys(seatsByRow).sort()

  return (
    <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-2">Select Your Seats</h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-400 rounded"></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 min-w-max">
        {/* Stage */}
        <div className="w-64 h-12 bg-purple-600 text-white rounded flex items-center justify-center font-bold mb-4 shadow-lg">
          STAGE
        </div>

        {/* Seats */}
        {sortedRows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="font-bold w-6 text-center">{row}</span>
            {seatsByRow[row].map((seat) => (
              <div
                key={seat.id}
                className={getSeatClasses(seat)}
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
                title={`${seat.row}${seat.number}`}
              >
                {seat.number}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
