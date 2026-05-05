import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Users, Banknote, Sparkles } from 'lucide-react'

const RecommendedRidesPage = ({ user }) => {
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchRecommended()
  }, [user])

  const fetchRecommended = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/rides/recommended', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setRides(data.rides || data || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={28} className="text-primary" />
          <h1 className="text-3xl font-bold">Recommended Rides</h1>
        </div>
        <p className="text-base-content/60">Rides suggested based on your saved routes and ride history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl">No recommendations yet</p>
          <p className="text-sm mt-2">Save some routes or join rides to get personalized recommendations</p>
          <div className="flex gap-3 justify-center mt-6">
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/saved-routes')}>
              Save a Route
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
              Browse All Rides
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-primary/10"
              onClick={() => navigate(`/rides/${ride._id}`)}
            >
              <div className="card-body">
                <div className="flex items-center gap-1 text-primary text-xs font-medium mb-2">
                  <Sparkles size={12} />
                  Recommended for you
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="w-0.5 h-6 bg-base-content/20"></div>
                    <div className="w-2 h-2 rounded-full bg-error"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium">{ride.origin}</span>
                    <span className="font-medium">{ride.destination}</span>
                  </div>
                </div>

                <div className="divider my-1"></div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-base-content/70">
                    <Clock size={14} />
                    <span>{formatDate(ride.departureTime)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-base-content/70">
                    <Clock size={14} />
                    <span>{formatTime(ride.departureTime)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-base-content/70">
                    <Users size={14} />
                    <span>{ride.availableSeats} seats left</span>
                  </div>
                  <div className="flex items-center gap-1 text-base-content/70">
                    <Banknote size={14} />
                    <span>Tk {ride.fare}</span>
                  </div>
                </div>

                <div className="divider my-1"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="w-8 rounded-full bg-primary text-primary-content">
                        <span className="text-xs">{ride.driver?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{ride.driver?.name}</span>
                  </div>
                  <div className="badge badge-success badge-outline">Open</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendedRidesPage