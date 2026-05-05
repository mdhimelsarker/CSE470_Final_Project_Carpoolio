import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const PassengerDashboardPage = ({ user }) => {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [completedRides, setCompletedRides] = useState([])
  const [allRequests, setAllRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchDashboard()
    fetchAllRequests()
  }, [user])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/dashboard/passenger', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setDashboard(data)
    } catch (error) {
      console.error('Error fetching passenger dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllRequests = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/requests/my', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setAllRequests(data.requests || [])
        const completed = data.requests?.filter(r => r.status === 'accepted' && r.ride?.status === 'completed') || []
        setCompletedRides(completed)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const getRequestId = (rideId) => {
    const req = allRequests.find(r => r.ride?._id === rideId && ['pending', 'accepted'].includes(r.status))
    return req?._id
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Passenger Dashboard</h1>
        <p className="text-base-content/60">Track your ride requests and upcoming trips</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center gap-3">
              <Car size={20} className="text-primary" />
              <div>
                <p className="text-xs text-base-content/50">Upcoming Rides</p>
                <p className="text-2xl font-bold">{dashboard?.upcomingRides?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-4">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-warning" />
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
                <p className="text-2xl font-bold">{completedRides.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Rides</h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Browse Rides</button>
          </div>
          {!dashboard?.upcomingRides?.length ? (
            <p className="text-base-content/50 text-sm py-4 text-center">No upcoming rides</p>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.upcomingRides.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                  <div>
                    <p className="font-medium">{request.ride?.origin} → {request.ride?.destination}</p>
                    <p className="text-sm text-base-content/60">{formatDate(request.ride?.departureTime)} — Tk {request.ride?.fare}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-outline">Accepted</div>
                    <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/rides/${request.ride?._id}`)}>View</button>
                    <button className="btn btn-info btn-xs" onClick={() => navigate(`/negotiate/${request._id}`)}>Negotiate</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
          {!dashboard?.pendingRequests?.length ? (
            <p className="text-base-content/50 text-sm py-4 text-center">No pending requests</p>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                  <div>
                    <p className="font-medium">{request.ride?.origin} → {request.ride?.destination}</p>
                    <p className="text-sm text-base-content/60">{formatDate(request.ride?.departureTime)} — Tk {request.ride?.fare}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-warning badge-outline">Pending</div>
                    <button className="btn btn-info btn-xs" onClick={() => navigate(`/negotiate/${request._id}`)}>Negotiate</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Completed Rides</h2>
          {!completedRides.length ? (
            <p className="text-base-content/50 text-sm py-4 text-center">No completed rides yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {completedRides.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                  <div>
                    <p className="font-medium">{request.ride?.origin} → {request.ride?.destination}</p>
                    <p className="text-sm text-base-content/60">{formatDate(request.ride?.departureTime)} — Tk {request.ride?.fare}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-outline">Completed</div>
                    <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/rides/${request.ride?._id}`)}>View</button>
                    <button className="btn btn-warning btn-xs" onClick={() => navigate(`/rides/${request.ride?._id}/review`)}>Review</button>
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

export default PassengerDashboardPage