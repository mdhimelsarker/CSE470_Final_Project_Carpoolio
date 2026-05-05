import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'

const RideHistoryPage = ({ user }) => {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/history/my-rides', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setHistory(data.history || data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'badge-success',
      cancelled: 'badge-error',
      ongoing: 'badge-warning',
      open: 'badge-info',
      full: 'badge-warning'
    }
    return styles[status] || 'badge-ghost'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ride History</h1>
        <p className="text-base-content/60">All your past rides as driver and passenger</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <Clock size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl">No ride history yet</p>
          <p className="text-sm mt-2">Your completed rides will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((ride) => (
            <div
              key={ride._id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/rides/${ride._id}`)}
            >
              <div className="card-body py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="w-0.5 h-5 bg-base-content/20"></div>
                      <div className="w-2 h-2 rounded-full bg-error"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{ride.origin}</span>
                      <span className="font-medium">{ride.destination}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`badge ${getStatusBadge(ride.status)} badge-outline`}>
                      {ride.status}
                    </div>
                    <p className="text-sm text-base-content/60">{formatDate(ride.departureTime)}</p>
                    <p className="text-sm font-medium">Tk {ride.fare}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RideHistoryPage