import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    university: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/profile/me', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
          university: data.user.university || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5001/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setUser(data.user)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-base-content/60">Manage your personal information</p>
      </div>

      {/* Avatar Section */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex items-center gap-6">
            <div className="avatar placeholder">
              <div className="w-20 rounded-full bg-primary text-primary-content">
                <span className="text-3xl">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-base-content/60">{user?.email}</p>
              <div className="badge badge-outline mt-1">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="font-semibold text-lg mb-4">Edit Information</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              <input
                type="text"
                name="name"
                className="input input-bordered"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Phone</span></label>
              <input
                type="text"
                name="phone"
                placeholder="e.g. 01XXXXXXXXX"
                className="input input-bordered"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">University</span></label>
              <input
                type="text"
                name="university"
                placeholder="e.g. BRAC University"
                className="input input-bordered"
                value={formData.university}
                onChange={handleChange}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Bio</span></label>
              <textarea
                name="bio"
                placeholder="Tell others a bit about yourself"
                className="textarea textarea-bordered h-24"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage