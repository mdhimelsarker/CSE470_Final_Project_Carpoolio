import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Car, Shield, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminPage = ({ user }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const usersRes = await fetch('http://localhost:5001/api/admin/users', {
        credentials: 'include'
      })
      const usersData = await usersRes.json()
      if (usersRes.ok) setUsers(Array.isArray(usersData) ? usersData : usersData.users || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId, isBanned) => {
    try {
      const endpoint = isBanned ? 'unban' : 'ban'
      const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/${endpoint}`, {
        method: 'PATCH',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to update user')
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`)
      fetchData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-base-content/60">Manage users and platform activity</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`} onClick={() => setActiveTab('users')}>Users</a>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="w-8 rounded-full bg-primary text-primary-content">
                              <span className="text-xs">{u.name?.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td><div className="badge badge-outline">{u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}</div></td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className={`badge ${u.isBanned ? 'badge-error' : 'badge-success'}`}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </div>
                      </td>
                      <td>
                        <button
                          className={`btn btn-xs ${u.isBanned ? 'btn-success' : 'btn-error'}`}
                          onClick={() => handleBanUser(u._id, u.isBanned)}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage