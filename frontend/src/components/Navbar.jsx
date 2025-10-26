import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth()

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              🎭 Theater Tickets
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Shows
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-tickets"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Tickets
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-sm">{user?.email}</span>
                <button
                  onClick={logout}
                  className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
