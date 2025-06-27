"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { blobAssets } from "@/lib/blob-assets"

// Updated playlist with centralized blob assets
const PLAYLIST = [
  {
    id: 1,
    title: "Happy Birthday Anna Cutie",
    artist: "Tung Tulip",
    duration: 210,
    audioUrl: blobAssets.music.song1.audio,
    cover: blobAssets.music.song1.cover,
  },
  {
    id: 2,
    title: "Senjitaley",
    artist: "Remo",
    duration: 245,
    audioUrl: blobAssets.music.song2.audio,
    cover: blobAssets.music.song2.cover,
  },
  {
    id: 3,
    title: "Nee kavithaigala",
    artist: "Maragatha Naanayam",
    duration: 183,
    audioUrl: blobAssets.music.song3.audio,
    cover: blobAssets.music.song3.cover,
  },
  {
    id: 4,
    title: "Sahibaa",
    artist: "Anarkali",
    duration: 237,
    audioUrl: blobAssets.music.song4.audio,
    cover: blobAssets.music.song4.cover,
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
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()
  const currentTrack = PLAYLIST[currentTrackIndex]

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      audioRef.current.preload = "metadata"
      audioRef.current.volume = volume / 100
      audioRef.current.crossOrigin = "anonymous"

      // Set up event listeners
      const audio = audioRef.current

      const handleLoadedMetadata = () => {
        setDuration(audio.duration || 0)
        setIsLoading(false)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime || 0)
      }

      const handleEnded = () => {
        handleNext()
      }

      const handleError = (e: Event) => {
        console.error("Audio error:", e)
        setIsLoading(false)
        setIsPlaying(false)
        toast({
          title: "Playback Error",
          description: "Unable to play this track. Skipping to next song.",
          variant: "destructive",
        })
        setTimeout(() => handleNext(), 1000)
      }

      const handleLoadStart = () => {
        setIsLoading(true)
      }

      const handleCanPlay = () => {
        setIsLoading(false)
      }

      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("error", handleError)
      audio.addEventListener("loadstart", handleLoadStart)
      audio.addEventListener("canplay", handleCanPlay)

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("error", handleError)
        audio.removeEventListener("loadstart", handleLoadStart)
        audio.removeEventListener("canplay", handleCanPlay)
        audio.pause()
      }
    }
  }, [])

  // Load new track when track index changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const audio = audioRef.current
      audio.src = currentTrack.audioUrl
      setCurrentTime(0)
      setIsLoading(true)

      // Auto-play if user has interacted and we're not blocked
      if (hasUserInteracted && !autoPlayBlocked) {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              setAutoPlayBlocked(false)
            })
            .catch((error) => {
              console.log("Auto-play blocked:", error)
              setAutoPlayBlocked(true)
              setIsPlaying(false)
              if (hasUserInteracted) {
                toast({
                  title: "Auto-play Blocked",
                  description: "Click play to start the music. Your browser blocked auto-play.",
                })
              }
            })
        }
      }
    }
  }, [currentTrackIndex, currentTrack, hasUserInteracted, autoPlayBlocked])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    setHasUserInteracted(true)

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
          setAutoPlayBlocked(false)
        }
      }
    } catch (error) {
      console.error("Playback error:", error)
      setIsPlaying(false)
      toast({
        title: "Playback Error",
        description: "Unable to play this track. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePrevious = () => {
    const newIndex = currentTrackIndex === 0 ? PLAYLIST.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
    setHasUserInteracted(true)
  }

  const handleNext = () => {
    const newIndex = currentTrackIndex === PLAYLIST.length - 1 ? 0 : currentTrackIndex + 1
    setCurrentTrackIndex(newIndex)
    setHasUserInteracted(true)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0])) {
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
    setHasUserInteracted(true)
  }

  return (
    <div className="space-y-6">
      {/* Current track info */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 relative">
          <img
            src={currentTrack.cover || "/placeholder.svg"}
            alt={currentTrack.title}
            className="h-full w-full object-cover"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-purple-800">{currentTrack.title}</h3>
          <p className="text-gray-600">{currentTrack.artist}</p>
          {autoPlayBlocked && hasUserInteracted && (
            <Badge variant="outline" className="mt-1 text-xs text-orange-600 border-orange-300">
              Auto-play blocked - Click play
            </Badge>
          )}
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
          disabled={!duration}
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
              <Loader2 className="h-6 w-6 animate-spin" />
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
              className={`cursor-pointer hover:bg-pink-50 transition-all duration-200 ${
                index === currentTrackIndex
                  ? "border-pink-400 bg-pink-50 shadow-md ring-2 ring-pink-200"
                  : "border-gray-200 hover:border-pink-300"
              }`}
              onClick={() => handleTrackSelect(index)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0 relative">
                  <img
                    src={track.cover || "/placeholder.svg"}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                  {index === currentTrackIndex && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium text-sm truncate ${
                      index === currentTrackIndex ? "text-pink-700" : "text-purple-800"
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  {index === currentTrackIndex && isPlaying && (
                    <Badge variant="default" className="text-xs bg-pink-500">
                      Playing
                    </Badge>
                  )}
                  <div className="text-xs text-gray-500">{formatTime(track.duration)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Instructions for first-time users */}
      {!hasUserInteracted && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-700">
              🎵 Click on any song or the play button to start the birthday playlist!
              <br />
              <span className="text-xs">Note: Auto-play will work after your first interaction.</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
