import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, CheckCircle, XCircle, Banknote } from 'lucide-react'
import toast from 'react-hot-toast'

const DriverDashboardPage = ({ user }) => {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDashboard()
  }, [user])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/dashboard/driver', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setDashboard(data)
    } catch (error) {
      console.error('Error fetching driver dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (rideId, requestId, action) => {
    try {
      const res = await fetch(`http://localhost:5001/api/rides/${rideId}/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Request ${action}ed successfully`)
      fetchDashboard()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleStartRide = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/ride-status/${rideId}/start`, {
        method: 'PATCH',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Ride started!')
      fetchDashboard()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCompleteRide = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/ride-status/${rideId}/complete`, {
        method: 'PATCH',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Ride completed!')
      fetchDashboard()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
        <p className="text-base-content/60">Manage your rides and requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center gap-3">
              <Car size={20} className="text-primary" />
              <div>
                <p className="text-xs text-base-content/50">Active Rides</p>
                <p className="text-2xl font-bold">{dashboard?.activeRides?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-warning" />
              <div>
                <p className="text-xs text-base-content/50">Pending Requests</p>
                <p className="text-2xl font-bold">{dashboard?.pendingRequests?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-success" />
              <div>
                <p className="text-xs text-base-content/50">Completed Rides</p>
                <p className="text-2xl font-bold">{dashboard?.statistics?.completedRides || 0}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center gap-3">
              <Banknote size={20} className="text-info" />
              <div>
                <p className="text-xs text-base-content/50">Total Earnings</p>
                <p className="text-2xl font-bold">Tk {dashboard?.statistics?.totalEarnings || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Rides */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Active Rides</h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/post-ride')}>
              + Post Ride
            </button>
          </div>
          {!dashboard?.activeRides?.length ? (
            <p className="text-base-content/50 text-sm py-4 text-center">No active rides</p>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.activeRides.map((ride) => (
                <div key={ride._id} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                  <div>
                    <p className="font-medium">{ride.origin} → {ride.destination}</p>
                    <p className="text-sm text-base-content/60">{formatDate(ride.departureTime)} — {ride.availableSeats} seats left</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`badge ${ride.status === 'open' ? 'badge-success' : ride.status === 'ongoing' ? 'badge-info' : 'badge-warning'} badge-outline`}>
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </div>
                    {ride.status === 'full' && (
                      <button className="btn btn-info btn-xs" onClick={() => handleStartRide(ride._id)}>
                        Start
                      </button>
                    )}
                    {ride.status === 'ongoing' && (
                      <button className="btn btn-success btn-xs" onClick={() => handleCompleteRide(ride._id)}>
                        Complete
                      </button>
                    )}
                    <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/rides/${ride._id}`)}>
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Requests */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
          {!dashboard?.pendingRequests?.length ? (
            <p className="text-base-content/50 text-sm py-4 text-center">No pending requests</p>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="w-8 rounded-full bg-primary text-primary-content">
                        <span className="text-xs">{request.passenger?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{request.passenger?.name}</p>
                      <p className="text-sm text-base-content/60">
                        {request.ride?.origin} → {request.ride?.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-success btn-sm gap-1"
                      onClick={() => handleRespond(request.ride._id, request._id, 'accept')}
                    >
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button
                      className="btn btn-error btn-sm gap-1"
                      onClick={() => handleRespond(request.ride._id, request._id, 'reject')}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriverDashboardPage