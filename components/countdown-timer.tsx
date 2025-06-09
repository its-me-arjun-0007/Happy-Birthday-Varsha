"use client"

import { useEffect, useState } from "react"
import dayjs from "dayjs"

interface CountdownTimerProps {
  targetDate: string
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const interval = setInterval(() => {
      const now = dayjs()
      const target = dayjs(targetDate)
      const diff = target.diff(now, "second")

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
        clearInterval(interval)
        return
      }

      const days = Math.floor(diff / (24 * 60 * 60))
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((diff % (60 * 60)) / 60)
      const seconds = Math.floor(diff % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (!isMounted) {
    return null
  }

  return (
    <div className="grid grid-cols-4 gap-4 text-center">
      <div className="bg-pink-500 rounded-lg p-4 text-white">
        <div className="text-4xl md:text-5xl font-bold">{timeLeft.days}</div>
        <div className="text-sm uppercase tracking-wide mt-1">Days</div>
      </div>
      <div className="bg-purple-500 rounded-lg p-4 text-white">
        <div className="text-4xl md:text-5xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm uppercase tracking-wide mt-1">Hours</div>
      </div>
      <div className="bg-pink-500 rounded-lg p-4 text-white">
        <div className="text-4xl md:text-5xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm uppercase tracking-wide mt-1">Minutes</div>
      </div>
      <div className="bg-purple-500 rounded-lg p-4 text-white">
        <div className="text-4xl md:text-5xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm uppercase tracking-wide mt-1">Seconds</div>
      </div>
    </div>
  )
}
