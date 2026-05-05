import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Car, Shield, CheckCircle, BarChart } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminPage = ({ user }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [rides, setRides] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'admin') { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [usersRes, ridesRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/users', { credentials: 'include' }),
        fetch('http://localhost:5001/api/admin/rides', { credentials: 'include' }),
        fetch('http://localhost:5001/api/admin/rides/analytics', { credentials: 'include' })
      ])
      const usersData = await usersRes.json()
      const ridesData = await ridesRes.json()
      const analyticsData = await analyticsRes.json()
      if (usersRes.ok) setUsers(Array.isArray(usersData) ? usersData : usersData.users || [])
      if (ridesRes.ok) setRides(ridesData.rides || [])
      if (analyticsRes.ok) setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId, isBanned) => {
    try {
      const endpoint = isBanned ? 'unban' : 'ban'
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/${endpoint}`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to update user')
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`)
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleVerifyUser = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/verify`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to verify user')
      toast.success('User verified successfully')
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteRide = async (rideId) => {
    if (!confirm('Are you sure you want to delete this ride?')) return
    try {
      const res = await fetch(`http://localhost:5001/api/admin/rides/${rideId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to delete ride')
      toast.success('Ride deleted successfully')
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-base-content/60">Manage users, rides and platform analytics</p>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body py-4">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-primary" />
                <div>
                  <p className="text-xs text-base-content/50">Total Users</p>
                  <p className="text-2xl font-bold">{analytics.totalUsers || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body py-4">
              <div className="flex items-center gap-3">
                <Car size={20} className="text-success" />
                <div>
                  <p className="text-xs text-base-content/50">Total Rides</p>
                  <p className="text-2xl font-bold">{analytics.totalRides || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body py-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-info" />
                <div>
                  <p className="text-xs text-base-content/50">Completed</p>
                  <p className="text-2xl font-bold">{analytics.completedRides || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body py-4">
              <div className="flex items-center gap-3">
                <BarChart size={20} className="text-warning" />
                <div>
                  <p className="text-xs text-base-content/50">Total Revenue</p>
                  <p className="text-2xl font-bold">Tk {analytics.totalRevenue || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`} onClick={() => setActiveTab('users')}>Users</a>
        <a className={`tab ${activeTab === 'rides' ? 'tab-active' : ''}`} onClick={() => setActiveTab('rides')}>Rides</a>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="w-8 rounded-full bg-primary text-primary-content">
                              <span className="text-xs">{u.name?.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td><div className="badge badge-outline">{u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}</div></td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td><div className={`badge ${u.isBanned ? 'badge-error' : 'badge-success'}`}>{u.isBanned ? 'Banned' : 'Active'}</div></td>
                      <td><div className={`badge ${u.isVerified ? 'badge-success' : 'badge-ghost'}`}>{u.isVerified ? 'Verified' : 'Unverified'}</div></td>
                      <td>
                        <div className="flex gap-1">
                          <button className={`btn btn-xs ${u.isBanned ? 'btn-success' : 'btn-error'}`} onClick={() => handleBanUser(u._id, u.isBanned)}>
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          {!u.isVerified && (
                            <button className="btn btn-xs btn-info" onClick={() => handleVerifyUser(u._id)}>
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rides Tab */}
      {activeTab === 'rides' && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>Departure</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-base-content/50 py-8">No rides found</td></tr>
                  ) : rides.map((ride) => (
                    <tr key={ride._id}>
                      <td>{ride.origin} → {ride.destination}</td>
                      <td>{ride.driver?.name || 'N/A'}</td>
                      <td>{formatDate(ride.departureTime)}</td>
                      <td>Tk {ride.fare}</td>
                      <td><div className={`badge badge-outline ${ride.status === 'open' ? 'badge-success' : ride.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>{ride.status}</div></td>
                      <td><button className="btn btn-xs btn-error" onClick={() => handleDeleteRide(ride._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage