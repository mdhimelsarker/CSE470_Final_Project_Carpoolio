import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AnimatedBackground from './components/AnimatedBackground'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RideDetailPage from './pages/RideDetailPage'
import PostRidePage from './pages/PostRidePage'
import DriverDashboardPage from './pages/DriverDashboardPage'
import PassengerDashboardPage from './pages/PassengerDashboardPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import RideHistoryPage from './pages/RideHistoryPage'
import VehicleManagementPage from './pages/VehicleManagementPage'
import SavedRoutesPage from './pages/SavedRoutesPage'
import AdminPage from './pages/AdminPage'
import RecommendedRidesPage from './pages/RecommendedRidesPage'
import ReviewPage from './pages/ReviewPage'
import NotFoundPage from './pages/NotFoundPage'
import NegotiationPage from './pages/NegotiationPage'

const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "nord")
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const toggleTheme = () => {
    const newTheme = theme === "nord" ? "sunset" : "nord"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      setUnreadCount(0)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/notifications', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        const count = data.notifications?.filter(n => !n.isRead).length || 0
        setUnreadCount(count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  useEffect(() => {
    const restoreUser = async () => {
      try {
        let res = await fetch('http://localhost:5001/api/auth/me', {
          credentials: 'include'
        })
        if (!res.ok) {
          const refreshRes = await fetch('http://localhost:5001/api/auth/refresh-token', {
            method: 'POST',
            credentials: 'include'
          })
          if (refreshRes.ok) {
            res = await fetch('http://localhost:5001/api/auth/me', {
              credentials: 'include'
            })
          }
        }
        const data = await res.json()
        if (res.ok) {
          setUser(data.user)
          fetchUnreadCount()
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
      }
    }
    restoreUser()
  }, [])

  useEffect(() => {
    if (user) fetchUnreadCount()
    else setUnreadCount(0)
  }, [user])

  return (
    <div data-theme={theme} className="min-h-screen">
      <AnimatedBackground theme={theme} />
      <Navbar theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} unreadCount={unreadCount} />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/rides/:rideId" element={<RideDetailPage user={user} />} />
          <Route path="/rides/:rideId/review" element={<ReviewPage user={user} />} />
          <Route path="/post-ride" element={<PostRidePage user={user} />} />
          <Route path="/dashboard/driver" element={<DriverDashboardPage user={user} />} />
          <Route path="/dashboard/passenger" element={<PassengerDashboardPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
          <Route path="/notifications" element={<NotificationsPage user={user} onNotificationRead={fetchUnreadCount} />} />
          <Route path="/negotiate/:requestId" element={<NegotiationPage user={user} />} />
          <Route path="/history" element={<RideHistoryPage user={user} />} />
          <Route path="/vehicles" element={<VehicleManagementPage user={user} />} />
          <Route path="/saved-routes" element={<SavedRoutesPage user={user} />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
          <Route path="/recommended" element={<RecommendedRidesPage user={user} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App