import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Users, Banknote, Car, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const RideDetailPage = ({ user }) => {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/rides/${rideId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setRide(data)
      } catch (error) {
        toast.error('Failed to load ride details')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    const checkExistingRequest = async () => {
      if (!user) return
      try {
        const res = await fetch('http://localhost:5001/api/requests/my', {
          credentials: 'include'
        })
        const data = await res.json()
        if (res.ok) {
          const existing = data.requests?.find(
            r => r.ride?._id === rideId && ['pending', 'accepted'].includes(r.status)
          )
          if (existing) setHasRequested(true)
        }
      } catch (error) {
        console.error('Error checking requests:', error)
      }
    }

    fetchRide()
    checkExistingRequest()
  }, [rideId, user])

  const handleRequestJoin = async () => {
    if (!user) return toast.error('Please login to request a ride')
    setRequesting(true)
    try {
      const res = await fetch(`http://localhost:5001/api/rides/${rideId}/requests`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Ride request sent successfully!')
      setHasRequested(true)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setRequesting(false)
    }
  }

  const handleCancelRide = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return
    try {
      const res = await fetch(`http://localhost:5001/api/rides/${rideId}/cancel`, {
        method: 'PATCH',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Ride cancelled successfully')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  if (!ride) return null

  const isDriver = user?.id === ride.driver?._id

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost gap-2 mb-6 pl-0"
      >
        <ArrowLeft size={18} /> Back to rides
      </button>

      {/* Main Card */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">

          {/* Status Badge */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Ride Details</h2>
            <div className={`badge badge-lg ${ride.status === 'open' ? 'badge-success' : ride.status === 'full' ? 'badge-warning' : ride.status === 'ongoing' ? 'badge-info' : 'badge-error'}`}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="w-0.5 h-10 bg-base-content/20"></div>
              <div className="w-3 h-3 rounded-full bg-error"></div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-base-content/50 mb-0.5">From</p>
                <p className="text-lg font-semibold">{ride.origin}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50 mb-0.5">To</p>
                <p className="text-lg font-semibold">{ride.destination}</p>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Ride Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-base-content/50">Date</span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span className="text-sm font-medium">{formatDate(ride.departureTime)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-base-content/50">Departure</span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span className="text-sm font-medium">{formatTime(ride.departureTime)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-base-content/50">Seats Available</span>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span className="text-sm font-medium">{ride.availableSeats} seats</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-base-content/50">Fare</span>
              <div className="flex items-center gap-1">
                <Banknote size={14} />
                <span className="text-sm font-medium">Tk {ride.fare}</span>
              </div>
            </div>
          </div>

          {ride.vehicle && (
            <>
              <div className="divider"></div>
              <div className="flex items-center gap-2">
                <Car size={16} />
                <span className="text-sm">{ride.vehicle.brand} — {ride.vehicle.type} — {ride.vehicle.plateNumber}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Driver Card */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h3 className="font-semibold text-lg mb-3">Driver</h3>
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="w-14 rounded-full bg-primary text-primary-content">
                <span className="text-xl">{ride.driver?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <p className="font-semibold">{ride.driver?.name}</p>
              <p className="text-sm text-base-content/60">{ride.driver?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isDriver && ride.status === 'open' && !hasRequested && (
        <button
          onClick={handleRequestJoin}
          className="btn btn-primary w-full"
          disabled={requesting}
        >
          {requesting ? <span className="loading loading-spinner"></span> : 'Request to Join'}
        </button>
      )}
      {!isDriver && hasRequested && ride.status !== 'completed' && (
        <div className="btn btn-disabled w-full">Already Requested</div>
      )}
      {!isDriver && ride.status === 'completed' && (
        <button
          className="btn btn-warning w-full"
          onClick={() => navigate(`/rides/${rideId}/review`)}
        >
          Leave a Review
        </button>
      )}
      {isDriver && ride.status !== 'completed' && ride.status !== 'cancelled' && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/post-ride?edit=${rideId}`)}
            className="btn btn-outline flex-1"
          >
            Edit Ride
          </button>
          <button
            onClick={handleCancelRide}
            className="btn btn-error flex-1"
          >
            Cancel Ride
          </button>
        </div>
      )}
    </div>
  )
}

export default RideDetailPage