const icons = ['🚗', '📍', '🛣️', '🚙', '📌', '🗺️', '🚕', '🛤️', '🚦', '🅿️']

const generateParticles = () => {
  const cols = 8
  const rows = 5
  return Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      id: i,
      icon: icons[i % icons.length],
      x: (col / cols) * 100 + (Math.random() * 14 - 7),
      y: (row / rows) * 100 + (Math.random() * 18 - 9),
      size: Math.random() * 12 + 18,
      duration: Math.random() * 15 + 20,
      delay: Math.random() * 8,
    }
  })
}

const particles = generateParticles()

const AnimatedBackground = ({ theme }) => {
  const opacity = theme === 'sunset' ? 0.18 : 0.22

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity,
            animation: `float-${p.id % 3} ${p.duration}s ${p.delay}s infinite ease-in-out`,
          }}
        >
          {p.icon}
        </div>
      ))}

      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(12px, -15px) rotate(4deg); }
          66% { transform: translate(-8px, 8px) rotate(-2deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-15px, 12px) rotate(-4deg); }
          66% { transform: translate(8px, -8px) rotate(2deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(8px, 15px) rotate(6deg); }
        }
      `}</style>
    </div>
  )
}

export default AnimatedBackground