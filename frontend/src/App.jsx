import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import ShowPage from './pages/ShowPage'
import MyTicketsPage from './pages/MyTicketsPage'
import AdminPage from './pages/AdminPage'
import AdminLogin from './pages/AdminLogin'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/show/:id" element={<ShowPage />} />
          <Route
            path="/my-tickets"
            element={
              <PrivateRoute>
                <MyTicketsPage />
              </PrivateRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
