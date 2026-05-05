import { useNavigate, Link } from 'react-router-dom'
import { Bell, Moon, Sun, Car } from 'lucide-react'

const Navbar = ({ theme, toggleTheme, user, onLogout, unreadCount }) => {
  const navigate = useNavigate()

  return (
    <div className={`sticky top-0 z-50 shadow-md ${theme === "nord" ? "bg-[#1e2a3a]" : "bg-[#1a1a2e]"}`}>
      <div className="navbar container mx-auto px-4">

        {/* Left — Logo */}
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Car size={24} />
            Carpoolio
          </Link>
        </div>

        {/* Middle — Nav Links */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li><Link to="/" className="text-white hover:bg-white/10 active:bg-white/10 rounded-lg focus:bg-transparent focus:text-white">Browse Rides</Link></li>
            <li><Link to="/recommended" className="text-white hover:bg-white/10 active:bg-white/10 rounded-lg focus:bg-transparent focus:text-white">Recommended</Link></li>
            <li><Link to="/post-ride" className="text-white hover:bg-white/10 active:bg-white/10 rounded-lg focus:bg-transparent focus:text-white">Post a Ride</Link></li>
            <li><Link to="/dashboard/driver" className="text-white hover:bg-white/10 active:bg-white/10 rounded-lg focus:bg-transparent focus:text-white">Driver Dashboard</Link></li>
            <li><Link to="/dashboard/passenger" className="text-white hover:bg-white/10 active:bg-white/10 rounded-lg focus:bg-transparent focus:text-white">Passenger Dashboard</Link></li>
          </ul>
        </div>

        {/* Right — Icons */}
        <div className="navbar-end flex items-center gap-2">

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost btn-circle text-white">
            {theme === "nord" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          <Link to="/notifications" className="btn btn-ghost btn-circle text-white">
            <div className="indicator">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="badge badge-sm badge-error indicator-item">{unreadCount}</span>
              )}
            </div>
          </Link>

          {/* Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold cursor-pointer">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-box w-52 bg-base-100 text-base-content">
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/history">Ride History</Link></li>
              <li><Link to="/vehicles">My Vehicles</Link></li>
              <li><Link to="/saved-routes">Saved Routes</Link></li>
              {user?.role === "admin" && (
                <li><Link to="/admin">Admin Panel</Link></li>
              )}
              <hr className="my-1" />
              <li><a className="text-error cursor-pointer" onClick={() => { onLogout(); navigate('/login') }}>Logout</a></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Navbar