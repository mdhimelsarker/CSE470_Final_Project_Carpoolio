import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Users, Banknote, Search } from 'lucide-react'

const RIDES_PER_PAGE = 6

const HomePage = () => {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState({ origin: '', destination: '', date: '', seats: '' })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const navigate = useNavigate()

  const fetchRides = async (currentPage = 1, replace = true) => {
    if (currentPage === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams()
      if (filters.origin) params.append('origin', filters.origin)
      if (filters.destination) params.append('destination', filters.destination)
      if (filters.date) params.append('date', filters.date)
      if (filters.seats) params.append('seats', filters.seats)
      params.append('page', currentPage)
      params.append('limit', RIDES_PER_PAGE)

      const res = await fetch(`http://localhost:5001/api/rides?${params}`)
      const data = await res.json()

      const newRides = Array.isArray(data) ? data : data.rides || []
      if (replace) {
        setRides(newRides)
      } else {
        setRides(prev => [...prev, ...newRides])
      }
      setHasMore(newRides.length === RIDES_PER_PAGE)
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchRides(1, true)
  }, [])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRides(1, true)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchRides(nextPage, false)
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Rides</h1>
        <p className="text-base-content/60">Find a ride that matches your route</p>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="card bg-base-100 shadow-md mb-8">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">From</span></label>
              <input
                type="text"
                name="origin"
                placeholder="Origin"
                className="input input-bordered"
                value={filters.origin}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">To</span></label>
              <input
                type="text"
                name="destination"
                placeholder="Destination"
                className="input input-bordered"
                value={filters.destination}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Date</span></label>
              <input
                type="date"
                name="date"
                className="input input-bordered"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Seats needed</span></label>
              <input
                type="number"
                name="seats"
                placeholder="1"
                min="1"
                className="input input-bordered"
                value={filters.seats}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary gap-2">
              <Search size={16} /> Search Rides
            </button>
          </div>
        </div>
      </form>

      {/* Rides List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <p className="text-xl">No rides found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/rides/${ride._id}`)}
              >
                <div className="card-body">
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

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                className="btn btn-outline gap-2"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? <span className="loading loading-spinner"></span> : 'Load More'}
              </button>
            </div>
          )}

          {!hasMore && rides.length > 0 && (
            <p className="text-center text-base-content/50 text-sm mt-8">All rides loaded</p>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage