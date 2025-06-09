"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

// Sample playlist
const PLAYLIST = [
  {
    id: 1,
    title: "Happy Birthday Song",
    artist: "Traditional",
    duration: 210, // in seconds
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    title: "Celebration",
    artist: "Kool & The Gang",
    duration: 245,
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    title: "Birthday",
    artist: "The Beatles",
    duration: 183,
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    title: "Can't Stop the Feeling",
    artist: "Justin Timberlake",
    duration: 237,
    cover: "/placeholder.svg?height=80&width=80",
  },
]

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrack = PLAYLIST[currentTrackIndex]

  // In a real app, you would use actual audio files
  // For this demo, we'll simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 1
          if (newTime >= currentTrack.duration) {
            handleNext()
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentTrack.duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex === 0 ? PLAYLIST.length - 1 : prevIndex - 1))
    setCurrentTime(0)
  }

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex === PLAYLIST.length - 1 ? 0 : prevIndex + 1))
    setCurrentTime(0)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume / 100
    }
  }

  return (
    <div className="space-y-6">
      {/* Current track info */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={currentTrack.cover || "/placeholder.svg"}
            alt={currentTrack.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-purple-800">{currentTrack.title}</h3>
          <p className="text-gray-600">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Player controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-500">{formatTime(currentTrack.duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          max={currentTrack.duration}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <SkipBack className="h-6 w-6" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <SkipForward className="h-6 w-6" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-28 cursor-pointer"
        />
      </div>

      {/* Playlist */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">Playlist</h3>
        <div className="space-y-2">
          {PLAYLIST.map((track, index) => (
            <Card
              key={track.id}
              className={`cursor-pointer hover:bg-pink-50 transition-colors ${
                index === currentTrackIndex ? "border-pink-400 bg-pink-50" : "border-gray-200"
              }`}
              onClick={() => {
                setCurrentTrackIndex(index)
                setCurrentTime(0)
                setIsPlaying(true)
              }}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={track.cover || "/placeholder.svg"}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-purple-800 truncate">{track.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                <div className="text-xs text-gray-500">{formatTime(track.duration)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hidden audio element - in a real app, this would play actual audio files */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
