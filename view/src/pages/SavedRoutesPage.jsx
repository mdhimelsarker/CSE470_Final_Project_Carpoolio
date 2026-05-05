import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const SavedRoutesPage = ({ user }) => {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ label: '', origin: '', destination: '' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchRoutes()
  }, [user])

  const fetchRoutes = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/saved-routes', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setRoutes(Array.isArray(data) ? data : data.routes || [])
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5001/api/saved-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Route saved!')
      setShowForm(false)
      setFormData({ label: '', origin: '', destination: '' })
      fetchRoutes()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (routeId) => {
    if (!confirm('Delete this saved route?')) return
    try {
      const res = await fetch(`http://localhost:5001/api/saved-routes/${routeId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to delete route')
      toast.success('Route deleted!')
      fetchRoutes()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSearchRoute = (route) => {
    navigate(`/?origin=${route.origin}&destination=${route.destination}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Saved Routes</h1>
          <p className="text-base-content/60">Your frequently used routes</p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} /> Save Route
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h3 className="font-semibold text-lg mb-4">Save New Route</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Label</span></label>
                <input
                  type="text"
                  name="label"
                  placeholder="e.g. Daily Commute"
                  className="input input-bordered"
                  value={formData.label}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">From</span></label>
                  <input
                    type="text"
                    name="origin"
                    placeholder="Origin"
                    className="input input-bordered"
                    value={formData.origin}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">To</span></label>
                  <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    className="input input-bordered"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">Save Route</button>
                <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : routes.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <MapPin size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl">No saved routes yet</p>
          <p className="text-sm mt-2">Save your frequently used routes for quick access</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <div key={route._id} className="card bg-base-100 shadow-md">
              <div className="card-body flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{route.label}</p>
                    <p className="text-sm text-base-content/60">{route.origin} → {route.destination}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm gap-1"
                    onClick={() => handleSearchRoute(route)}
                  >
                    <Search size={16} /> Find Rides
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(route._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedRoutesPage