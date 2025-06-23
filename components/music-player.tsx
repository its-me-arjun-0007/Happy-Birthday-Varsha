"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

// Updated playlist with actual audio files
const PLAYLIST = [
  {
    id: 1,
    title: "Happy Birthday Song",
    artist: "Traditional",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Replace with actual audio URL
    cover: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    title: "Senjitaley",
    artist: "Remo",
    audioUrl: "https://files.catbox.moe/bbo9ig.mp3", // Replace with actual audio URL
    cover: "https://files.catbox.moe/wne5n9.jpg?height=80&width=80",
  },
  {
    id: 3,
    title: "Nee kavithaigala",
    artist: "Maragatha Naanayam",
    audioUrl: "https://files.catbox.moe/4dxt66.mp3", // Replace with actual audio URL
    cover: "https://files.catbox.moe/0ja0i5.jpg?height=80&width=80",
  },
  {
    id: 4,
    title: "Sahibaa",
    artist: "Anarkali",
    audioUrl: "https://files.catbox.moe/h8djbg.mp3", // Replace with actual audio URL
    cover: "https://files.catbox.moe/nvrvne.jpg?height=80&width=80",
  },
]

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrack = PLAYLIST[currentTrackIndex]

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [])

  // Load new track when currentTrackIndex changes
  useEffect(() => {
    if (audioRef.current && currentTrack.audioUrl) {
      setIsLoading(true)
      audioRef.current.src = currentTrack.audioUrl
      audioRef.current.load()
    }
  }, [currentTrackIndex, currentTrack.audioUrl])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      handleNext()
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      // Auto-play when track is ready
      if (isPlaying) {
        audio.play().catch(console.error)
      }
    }

    const handleError = () => {
      setIsLoading(false)
      console.error("Error loading audio file")
    }

    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
    }
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const handlePrevious = () => {
    const newIndex = currentTrackIndex === 0 ? PLAYLIST.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
    setCurrentTime(0)
  }

  const handleNext = () => {
    const newIndex = currentTrackIndex === PLAYLIST.length - 1 ? 0 : currentTrackIndex + 1
    setCurrentTrackIndex(newIndex)
    setCurrentTime(0)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setIsPlaying(true) // Auto-play when track is selected
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
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
        </div>
      </div>

      {/* Player controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-500">{formatTime(duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
          disabled={isLoading}
        />
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
            disabled={isLoading}
          >
            <SkipBack className="h-6 w-6" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
            disabled={isLoading}
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
              onClick={() => handleTrackSelect(index)}
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
                {index === currentTrackIndex && isPlaying && (
                  <div className="text-pink-500">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" className="hidden" />
    </div>
  )
}
