import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Banknote } from 'lucide-react'
import toast from 'react-hot-toast'

const PostRidePage = ({ user }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editRideId = searchParams.get('edit')
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    availableSeats: '',
    fare: '',
    vehicle: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchVehicles()
    if (editRideId) fetchRideData()
  }, [user])

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/vehicles/my', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setVehicles(Array.isArray(data) ? data : data.vehicles || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchRideData = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/rides/${editRideId}`)
      const data = await res.json()
      if (res.ok) {
        const formatForInput = (dateString) => {
          if (!dateString) return ''
          return new Date(dateString).toISOString().slice(0, 16)
        }
        setFormData({
          origin: data.origin || '',
          destination: data.destination || '',
          departureTime: formatForInput(data.departureTime),
          arrivalTime: formatForInput(data.arrivalTime),
          availableSeats: data.availableSeats || '',
          fare: data.fare || '',
          vehicle: data.vehicle?._id || ''
        })
      }
    } catch (error) {
      console.error('Error fetching ride:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.arrivalTime && formData.arrivalTime <= formData.departureTime) {
      return toast.error('Arrival time must be after departure time')
    }
    setLoading(true)
    try {
      const url = editRideId
        ? `http://localhost:5001/api/rides/${editRideId}`
        : 'http://localhost:5001/api/rides'
      const method = editRideId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          vehicle: formData.vehicle || null,
          arrivalTime: formData.arrivalTime || null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(editRideId ? 'Ride updated successfully!' : 'Ride posted successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{editRideId ? 'Edit Ride' : 'Post a Ride'}</h1>
        <p className="text-base-content/60">{editRideId ? 'Update your ride details' : 'Share your ride with fellow BRACU students'}</p>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">From</span></label>
                <input
                  type="text"
                  name="origin"
                  placeholder="Pickup location"
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
                  placeholder="Drop-off location"
                  className="input input-bordered"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Departure Time</span></label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  className="input input-bordered"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Arrival Time</span>
                  <span className="label-text-alt text-base-content/50">Optional</span>
                </label>
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  className="input input-bordered"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Available Seats</span></label>
                <input
                  type="number"
                  name="availableSeats"
                  placeholder="e.g. 3"
                  min="1"
                  max="10"
                  className="input input-bordered"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Fare per seat (Tk)</span></label>
                <input
                  type="number"
                  name="fare"
                  placeholder="e.g. 150"
                  min="0"
                  className="input input-bordered"
                  value={formData.fare}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Vehicle</span>
                <span className="label-text-alt text-base-content/50">Optional</span>
              </label>
              <select
                name="vehicle"
                className="select select-bordered"
                value={formData.vehicle}
                onChange={handleChange}
              >
                <option value="">No vehicle selected</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.brand} — {v.type} — {v.plateNumber}
                  </option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    No vehicles added yet.{' '}
                    <a onClick={() => navigate('/vehicles')} className="link link-primary cursor-pointer">
                      Add a vehicle
                    </a>
                  </span>
                </label>
              )}
            </div>

            <div className="mt-2">
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : editRideId ? 'Update Ride' : 'Post Ride'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default PostRidePage