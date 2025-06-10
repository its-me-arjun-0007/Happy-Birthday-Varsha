"use client"

import { useEffect, useState } from "react"

export default function Confetti() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* CSS-only confetti animation */}
      <div className="confetti-container">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ["#FF1493", "#9370DB", "#FFD700", "#FF6347", "#00CED1"][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
