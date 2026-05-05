import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const NegotiationPage = ({ user }) => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [negotiation, setNegotiation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [proposedFare, setProposedFare] = useState('')
  const [mode, setMode] = useState('message')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    initNegotiation()
  }, [user])

  const initNegotiation = async () => {
    try {
      const startRes = await fetch('http://localhost:5001/api/negotiations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rideRequestId: requestId })
      })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.message)
      await fetchNegotiation(startData.negotiation._id)
    } catch (error) {
      toast.error(error.message)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const fetchNegotiation = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/negotiations/${id}`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setNegotiation(data.negotiation)
    } catch (error) {
      console.error('Error fetching negotiation:', error)
    }
  }

  const handleSend = async () => {
    if (!negotiation) return
    if (mode === 'message' && !message.trim()) return toast.error('Enter a message')
    if (mode === 'propose' && !proposedFare) return toast.error('Enter a fare amount')
    setSubmitting(true)
    try {
      const url = mode === 'message'
        ? `http://localhost:5001/api/negotiations/${negotiation._id}/message`
        : `http://localhost:5001/api/negotiations/${negotiation._id}/propose-fare`
      const body = mode === 'message'
        ? { text: message }
        : { fare: proposedFare, text: message }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage('')
      setProposedFare('')
      await fetchNegotiation(negotiation._id)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAgree = async () => {
    if (!negotiation) return
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5001/api/negotiations/${negotiation._id}/agree-fare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Fare agreed!')
      await fetchNegotiation(negotiation._id)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isMe = (senderId) => {
    const id = senderId?._id || senderId
    return id?.toString() === user?.id?.toString()
  }

  const driverIdStr = negotiation?.driver?._id?.toString() || negotiation?.driver?.toString()
  const isDriver = user?.id?.toString() === driverIdStr

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg"></span></div>
  if (!negotiation) return null

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2 mb-6 pl-0">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card bg-base-100 shadow-md mb-4">
        <div className="card-body py-4">
          <h2 className="text-xl font-bold">Fare Negotiation</h2>
          <p className="text-base-content/60 text-sm">
            {negotiation.ride?.origin} → {negotiation.ride?.destination}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm">Listed fare: <span className="font-semibold">Tk {negotiation.ride?.fare}</span></span>
            {negotiation.finalFare && (
              <span className="text-sm text-success font-semibold">Agreed fare: Tk {negotiation.finalFare}</span>
            )}
            <div className={`badge ${negotiation.status === 'agreed' ? 'badge-success' : 'badge-info'}`}>
              {negotiation.status}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="card bg-base-100 shadow-md mb-4">
        <div className="card-body">
          <div className="flex flex-col gap-3 min-h-48 max-h-96 overflow-y-auto">
            {negotiation.messages?.length === 0 ? (
              <p className="text-center text-base-content/50 text-sm py-8">No messages yet. Start the negotiation!</p>
            ) : negotiation.messages.map((msg, i) => (
              <div key={i} className={`flex ${isMe(msg.sender?._id || msg.sender) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-xl px-4 py-2 ${isMe(msg.sender?._id || msg.sender) ? 'bg-primary text-primary-content' : 'bg-base-200'}`}>
                  {msg.type === 'proposal' && (
                    <p className="text-xs font-bold mb-1 opacity-70">Fare Proposal</p>
                  )}
                  {msg.type === 'agreement' && (
                    <p className="text-xs font-bold mb-1 opacity-70">Agreement</p>
                  )}
                  {msg.proposedFare && (
                    <p className="font-bold">Tk {msg.proposedFare}</p>
                  )}
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  <p className="text-xs opacity-50 mt-1">{msg.sender?.name || 'You'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      {negotiation.status === 'active' && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="tabs tabs-boxed mb-4">
              <a className={`tab ${mode === 'message' ? 'tab-active' : ''}`} onClick={() => setMode('message')}>Message</a>
              <a className={`tab ${mode === 'propose' ? 'tab-active' : ''}`} onClick={() => setMode('propose')}>Propose Fare</a>
            </div>

            {mode === 'propose' && (
              <div className="form-control mb-3">
                <label className="label"><span className="label-text">Proposed Fare (Tk)</span></label>
                <input type="number" className="input input-bordered" placeholder="e.g. 120" value={proposedFare} onChange={(e) => setProposedFare(e.target.value)} />
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder={mode === 'message' ? 'Type a message...' : 'Add a note (optional)'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary" onClick={handleSend} disabled={submitting}>
                <Send size={16} />
              </button>
            </div>

            {isDriver && (
              <button className="btn btn-success w-full mt-3" onClick={handleAgree} disabled={submitting}>
                Agree on Latest Proposal
              </button>
            )}
          </div>
        </div>
      )}

      {negotiation.status === 'agreed' && (
        <div className="alert alert-success mt-4">
          <CheckCircle size={18} />
          <span>Fare agreed at Tk {negotiation.finalFare}. Negotiation complete.</span>
        </div>
      )}
    </div>
  )
}

export default NegotiationPage