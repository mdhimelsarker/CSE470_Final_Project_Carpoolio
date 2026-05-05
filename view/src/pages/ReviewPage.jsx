import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

const ReviewPage = ({ user }) => {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [revieweeId, setRevieweeId] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchRide()
  }, [user])

  const fetchRide = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/rides/${rideId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setRide(data)
      if (user.id === data.driver?._id) {
        // user is driver, reviewing a passenger — not supported in basic flow
      } else {
        // user is passenger, reviewing the driver
        setRevieweeId(data.driver?._id)
      }
    } catch (error) {
      toast.error('Failed to load ride')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return toast.error('Please select a rating')
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ revieweeId, rideId, rating, comment })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Review submitted successfully!')
      navigate(`/rides/${rideId}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leave a Review</h1>
        <p className="text-base-content/60">
          Rate your experience for the ride from {ride?.origin} to {ride?.destination}
        </p>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">

          {/* Driver Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar placeholder">
              <div className="w-14 rounded-full bg-primary text-primary-content">
                <span className="text-xl">{ride?.driver?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <p className="font-semibold">{ride?.driver?.name}</p>
              <p className="text-sm text-base-content/60">Driver</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Star Rating */}
            <div className="form-control">
              <label className="label"><span className="label-text">Rating</span></label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={`${star <= (hoveredRating || rating) ? 'text-warning fill-warning' : 'text-base-content/20'}`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-base-content/60 mt-1">
                  {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Comment</span>
                <span className="label-text-alt text-base-content/50">Optional</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner"></span> : 'Submit Review'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewPage