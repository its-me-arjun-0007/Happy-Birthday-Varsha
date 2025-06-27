"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { getHeroVideoUrl } from "@/lib/blob-assets"

export default function HeroVideo() {
  /* ---------- state ---------- */
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([75])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [bufferedProgress, setBufferedProgress] = useState(0)

  /* ---------- refs ---------- */
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { toast } = useToast()

  /* ---------- helpers ---------- */
  const safeVideo = () => videoRef.current as HTMLVideoElement

  /* ---------- handlers ---------- */
  const togglePlay = async () => {
    const v = safeVideo()
    if (isPlaying) {
      v.pause()
      setIsPlaying(false)
    } else {
      try {
        await v.play()
        setIsPlaying(true)
      } catch {
        /* no-op */
      }
    }
  }

  const toggleMute = () => {
    const v = safeVideo()
    v.muted = !isMuted
    setIsMuted(v.muted)
  }

  const changeVolume = (val: number[]) => {
    const v = safeVideo()
    v.volume = val[0] / 100
    setVolume(val)
    if (v.muted && val[0] > 0) {
      v.muted = false
      setIsMuted(false)
    }
  }

  const replay = async () => {
    const v = safeVideo()
    v.currentTime = 0
    setEnded(false)
    await v.play()
    setIsPlaying(true)
  }

  const toggleFullscreen = () => {
    const el = videoRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen().catch(() => {})
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (value: number[]) => {
    const v = safeVideo()
    const seekTime = value[0]
    v.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleSeekStart = () => {
    setIsDragging(true)
  }

  const handleSeekEnd = () => {
    setIsDragging(false)
  }

  /* ---------- autoplay (sound first, fallback muted) ---------- */
  useEffect(() => {
    const v = safeVideo()

    v.muted = false
    v.playsInline = true
    v.loop = false
    v.preload = "auto"
    v.src = getHeroVideoUrl()

    const tryPlay = async () => {
      try {
        await v.play()
        setIsPlaying(true)
      } catch {
        // retry muted
        v.muted = true
        setIsMuted(true)
        try {
          await v.play()
          setIsPlaying(true)
          toast({
            title: "Autoplay blocked",
            description: "Click 🔊 to unmute the video.",
          })
        } catch {
          setIsPlaying(false)
        }
      }
    }

    /* ------- listeners ------- */
    const onLoaded = () => {
      setLoading(false)
      tryPlay()
    }
    const onError = () => {
      setLoading(false)
      setError("Unable to load the video.")
    }
    const onEnded = () => {
      setIsPlaying(false)
      setEnded(true)
    }

    v.addEventListener("loadeddata", onLoaded)
    v.addEventListener("error", onError)
    v.addEventListener("ended", onEnded)

    return () => {
      v.removeEventListener("loadeddata", onLoaded)
      v.removeEventListener("error", onError)
      v.removeEventListener("ended", onEnded)
    }
  }, [toast])

  // Progress tracking useEffect
  useEffect(() => {
    const v = safeVideo()

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(v.currentTime || 0)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(v.duration || 0)
    }

    const handleProgress = () => {
      if (v.buffered.length > 0) {
        const bufferedEnd = v.buffered.end(v.buffered.length - 1)
        const progress = (bufferedEnd / v.duration) * 100
        setBufferedProgress(progress)
      }
    }

    v.addEventListener("timeupdate", handleTimeUpdate)
    v.addEventListener("loadedmetadata", handleLoadedMetadata)
    v.addEventListener("progress", handleProgress)

    return () => {
      v.removeEventListener("timeupdate", handleTimeUpdate)
      v.removeEventListener("loadedmetadata", handleLoadedMetadata)
      v.removeEventListener("progress", handleProgress)
    }
  }, [isDragging])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return

      const v = safeVideo()

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          v.currentTime = Math.max(0, v.currentTime - 10)
          break
        case "ArrowRight":
          e.preventDefault()
          v.currentTime = Math.min(v.duration, v.currentTime + 10)
          break
        case "ArrowUp":
          e.preventDefault()
          const newVolumeUp = Math.min(100, volume[0] + 10)
          changeVolume([newVolumeUp])
          break
        case "ArrowDown":
          e.preventDefault()
          const newVolumeDown = Math.max(0, volume[0] - 10)
          changeVolume([newVolumeDown])
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "0":
        case "Home":
          e.preventDefault()
          v.currentTime = 0
          break
        case "End":
          e.preventDefault()
          v.currentTime = v.duration
          break
      }
    }

    // Only add keyboard listeners when video is focused or playing
    const v = safeVideo()
    if (isPlaying || document.activeElement === v) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPlaying, volume])

  /* ---------- render ---------- */
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <Card className="overflow-hidden border-4 border-pink-300 shadow-2xl">
        {/* ----- video wrapper ----- */}
        <div className="relative aspect-video bg-black">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted={isMuted}
            controls={false}
            aria-label="Birthday celebration video for Varsha"
            tabIndex={0}
            role="application"
            aria-describedby="video-description"
          />

          <div id="video-description" className="sr-only">
            Birthday celebration video with custom controls. Use spacebar to play/pause, arrow keys to seek and adjust
            volume, M to mute, F for fullscreen.
          </div>

          {/* Refined loading overlay */}
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-12 w-12 animate-spin rounded-full border-b-3 border-pink-400" />
            </div>
          )}

          {/* Refined replay / play overlay */}
          {!loading && !isPlaying && !error && (
            <button
              type="button"
              onClick={ended ? replay : togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all duration-300 hover:bg-black/50 group"
            >
              {ended ? (
                <RotateCcw className="h-16 w-16 sm:h-20 sm:w-20 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Play className="ml-1 h-16 w-16 sm:h-20 sm:w-20 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
          )}

          {/* Enhanced controls with progress bar */}
          {!loading && !error && (
            <div className="absolute bottom-0 left-0 right-0">
              {/* Refined progress bar section */}
              <div className="px-3 pb-1">
                <div className="relative">
                  {/* Buffer progress background */}
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-white/20 rounded-full transform -translate-y-1/2 transition-all duration-300"
                    style={{ width: `${bufferedProgress}%` }}
                  />

                  {/* Main progress slider - more compact */}
                  <Slider
                    value={[currentTime]}
                    onValueChange={handleSeek}
                    onValueCommit={handleSeekEnd}
                    onPointerDown={handleSeekStart}
                    max={duration || 100}
                    step={0.1}
                    className="w-full relative z-10 cursor-pointer h-3"
                    disabled={!duration}
                  />
                </div>

                {/* Compact time display */}
                <div className="flex justify-between items-center mt-0.5 text-xs text-white/70 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Refined control buttons */}
              <div className="bg-black/60 backdrop-blur-sm border-t border-white/5">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Play/Pause - optimized size */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      ) : (
                        <Play className="ml-0.5 h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      )}
                    </Button>

                    {/* Replay button when ended - compact */}
                    {ended && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={replay}
                        className="text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105"
                      >
                        <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}

                    {/* Mute/Unmute - refined */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      {isMuted ? (
                        <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>

                    {/* Volume slider - more compact */}
                    <div className="hidden sm:block w-16 md:w-20">
                      <Slider
                        max={100}
                        step={1}
                        value={volume}
                        onValueChange={changeVolume}
                        className="cursor-pointer h-2"
                      />
                    </div>

                    {/* Volume percentage - smaller text */}
                    <div className="sm:hidden text-white/70 text-xs font-mono min-w-[2.5rem]">{volume[0]}%</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Mobile volume control - compact */}
                    <div className="sm:hidden">
                      <div className="w-12">
                        <Slider
                          max={100}
                          step={1}
                          value={volume}
                          onValueChange={changeVolume}
                          className="cursor-pointer h-2"
                        />
                      </div>
                    </div>

                    {/* Fullscreen - refined */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ----- caption / description ----- */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 text-center">
          <h3 className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
            🎊 Birthday Celebration Video 🎊
          </h3>
          <p className="text-sm text-gray-700">Enjoy Varsha&rsquo;s special birthday clip with sound!</p>
        </div>
      </Card>
    </div>
  )
}
