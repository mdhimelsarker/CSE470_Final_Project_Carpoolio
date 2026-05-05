import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Plus, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

const VehicleManagementPage = ({ user }) => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    type: 'car',
    brand: '',
    plateNumber: '',
    seats: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchVehicles()
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
      const url = editingVehicle
        ? `http://localhost:5001/api/vehicles/${editingVehicle._id}`
        : 'http://localhost:5001/api/vehicles'
      const method = editingVehicle ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(editingVehicle ? 'Vehicle updated!' : 'Vehicle added!')
      setShowForm(false)
      setEditingVehicle(null)
      setFormData({ type: 'car', brand: '', plateNumber: '', seats: '' })
      fetchVehicles()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      type: vehicle.type,
      brand: vehicle.brand,
      plateNumber: vehicle.plateNumber,
      seats: vehicle.seats
    })
    setShowForm(true)
  }

  const handleDelete = async (vehicleId) => {
    try {
      const ridesRes = await fetch('http://localhost:5001/api/dashboard/driver', {
        credentials: 'include'
      })
      const ridesData = await ridesRes.json()
      const activeRides = ridesData.activeRides || []
      const attachedRide = activeRides.find(r => r.vehicle === vehicleId || r.vehicle?._id === vehicleId)

      if (attachedRide) {
        const confirm1 = confirm(
          `This vehicle is attached to an active ride (${attachedRide.origin} → ${attachedRide.destination}). Would you like to update that ride's vehicle before deleting?`
        )
        if (confirm1) {
          navigate(`/post-ride?edit=${attachedRide._id}`)
          return
        }
        return
      }

      if (!confirm('Are you sure you want to delete this vehicle?')) return

      const res = await fetch(`http://localhost:5001/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Vehicle deleted!')
      fetchVehicles()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Vehicles</h1>
          <p className="text-base-content/60">Manage your vehicles for ride posting</p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={() => { setShowForm(!showForm); setEditingVehicle(null); setFormData({ type: 'car', brand: '', plateNumber: '', seats: '' }) }}
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h3 className="font-semibold text-lg mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Vehicle Type</span></label>
                  <select name="type" className="select select-bordered" value={formData.type} onChange={handleChange}>
                    <option value="car">Car</option>
                    <option value="microbus">Microbus</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Brand</span></label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="e.g. Toyota"
                    className="input input-bordered"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Plate Number</span></label>
                  <input
                    type="text"
                    name="plateNumber"
                    placeholder="e.g. DHA-1234"
                    className="input input-bordered"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Seats</span></label>
                  <input
                    type="number"
                    name="seats"
                    placeholder="e.g. 4"
                    min="1"
                    className="input input-bordered"
                    value={formData.seats}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => { setShowForm(false); setEditingVehicle(null) }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <Car size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl">No vehicles added yet</p>
          <p className="text-sm mt-2">Add a vehicle to use it when posting rides</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="card bg-base-100 shadow-md">
              <div className="card-body flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Car size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{vehicle.brand}</p>
                    <p className="text-sm text-base-content/60">
                      {vehicle.type} — {vehicle.plateNumber} — {vehicle.seats} seats
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(vehicle)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(vehicle._id)}>
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

export default VehicleManagementPage