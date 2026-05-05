import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const NotificationsPage = ({ user, onNotificationRead }) => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/notifications', {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      })
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ))
      onNotificationRead()
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('http://localhost:5001/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      onNotificationRead()
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await fetch(`http://localhost:5001/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      setNotifications(notifications.filter(n => n._id !== notificationId))
      onNotificationRead()
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-base-content/60">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost gap-2" onClick={handleMarkAllRead}>
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card shadow-sm ${notification.isRead ? 'bg-base-100' : 'bg-primary/5 border border-primary/20'}`}
            >
              <div className="card-body flex-row items-start justify-between py-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.isRead ? 'bg-base-content/20' : 'bg-primary'}`}></div>
                  <div>
                    <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    {notification.relatedRide && (
                      <p
                        className="text-xs text-primary mt-1 cursor-pointer hover:underline"
                        onClick={() => navigate(`/rides/${notification.relatedRide._id}`)}
                      >
                        {notification.relatedRide.origin} → {notification.relatedRide.destination}
                      </p>
                    )}
                    <p className="text-xs text-base-content/40 mt-1">{formatTime(notification.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!notification.isRead && (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDelete(notification._id)}
                  >
                    <Trash2 size={14} />
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

export default NotificationsPage