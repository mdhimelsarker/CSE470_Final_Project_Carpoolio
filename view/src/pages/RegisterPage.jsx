import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const ADMIN_SECRET = 'carpoolio_admin_2026'

const RegisterPage = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAdminField, setShowAdminField] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (showAdminField && adminCode !== ADMIN_SECRET) {
      return toast.error('Invalid admin code')
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: showAdminField && adminCode === ADMIN_SECRET ? 'admin' : 'user'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setUser(data.user)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-2">Create an account</h2>
          <p className="text-base-content/60 mb-6">Join Carpoolio and start sharing rides</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              <input type="text" name="name" placeholder="Your full name" className="input input-bordered w-full" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" name="email" placeholder="you@bracu.ac.bd" className="input input-bordered w-full" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Password</span></label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" className="input input-bordered w-full pr-10" value={formData.password} onChange={handleChange} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Confirm Password</span></label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm your password" className="input input-bordered w-full pr-10" value={formData.confirmPassword} onChange={handleChange} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {showAdminField && (
              <div className="form-control">
                <label className="label"><span className="label-text">Admin Code</span></label>
                <input type="password" placeholder="Enter admin code" className="input input-bordered w-full" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary">Sign In</Link>
            </p>
            <button className="text-xs text-base-content/30 hover:text-base-content/50" onClick={() => setShowAdminField(!showAdminField)}>
              {showAdminField ? 'Regular signup' : 'Admin?'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage