"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle, Speaker } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { getHeroVideoUrl } from "@/lib/blob-assets"

export default function HeroVideo() {
  /* ---------- state ---------- */
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false) // Changed: Start with sound enabled
  const [volume, setVolume] = useState([75])
  const [previousVolume, setPreviousVolume] = useState(75) // Store volume before muting
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [bufferedProgress, setBufferedProgress] = useState(0)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  /* ---------- refs ---------- */
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  /* ---------- helpers ---------- */
  const safeVideo = () => videoRef.current as HTMLVideoElement

  /* ---------- audio context setup ---------- */
  useEffect(() => {
    // Initialize Web Audio API for better audio control
    if (typeof window !== "undefined" && window.AudioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
      } catch (error) {
        console.log("Web Audio API not supported")
      }
    }
  }, [])

  /* ---------- handlers ---------- */
  const togglePlay = async () => {
    const v = safeVideo()
    setHasUserInteracted(true)

    if (isPlaying) {
      v.pause()
      setIsPlaying(false)
    } else {
      try {
        // Resume audio context if suspended
        if (audioContext && audioContext.state === "suspended") {
          await audioContext.resume()
        }

        await v.play()
        setIsPlaying(true)
        setAutoplayBlocked(false)
      } catch (error) {
        console.error("Play failed:", error)
        setAutoplayBlocked(true)
        toast({
          title: "Playback blocked",
          description: "Your browser blocked autoplay. Click the play button to start.",
          variant: "destructive",
        })
      }
    }
  }

  const toggleMute = () => {
    const v = safeVideo()
    setHasUserInteracted(true)

    if (isMuted) {
      // Unmute: restore previous volume
      v.muted = false
      v.volume = previousVolume / 100
      setIsMuted(false)
      setVolume([previousVolume])

      toast({
        title: "Sound enabled",
        description: `Volume restored to ${previousVolume}%`,
      })
    } else {
      // Mute: save current volume and mute
      setPreviousVolume(volume[0])
      v.muted = true
      setIsMuted(true)

      toast({
        title: "Sound muted",
        description: "Click the volume button to unmute",
      })
    }
  }

  const changeVolume = (val: number[]) => {
    const v = safeVideo()
    const newVolume = val[0]

    setHasUserInteracted(true)
    setVolume(val)
    v.volume = newVolume / 100

    // Auto-unmute if volume is increased from 0
    if (newVolume > 0 && isMuted) {
      v.muted = false
      setIsMuted(false)
    }

    // Auto-mute if volume is set to 0
    if (newVolume === 0 && !isMuted) {
      v.muted = true
      setIsMuted(true)
    }

    // Store volume for unmute functionality
    if (newVolume > 0) {
      setPreviousVolume(newVolume)
    }

    // Show volume feedback
    if (newVolume === 0) {
      toast({
        title: "Muted",
        description: "Volume set to 0%",
      })
    } else if (newVolume === 100) {
      toast({
        title: "Max volume",
        description: "Volume set to 100%",
      })
    }
  }

  const showVolumeControl = () => {
    setShowVolumeSlider(true)

    // Clear existing timeout
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current)
    }

    // Hide after 3 seconds
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false)
    }, 3000)
  }

  const replay = async () => {
    const v = safeVideo()
    setHasUserInteracted(true)

    v.currentTime = 0
    setEnded(false)

    try {
      // Resume audio context if suspended
      if (audioContext && audioContext.state === "suspended") {
        await audioContext.resume()
      }

      await v.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Replay failed:", error)
      toast({
        title: "Replay failed",
        description: "Unable to replay video. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleFullscreen = () => {
    const el = videoRef.current
    if (!el) return

    setHasUserInteracted(true)

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
    setHasUserInteracted(true)

    v.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleSeekStart = () => {
    setIsDragging(true)
  }

  const handleSeekEnd = () => {
    setIsDragging(false)
  }

  /* ---------- enhanced autoplay with sound ---------- */
  useEffect(() => {
    const v = safeVideo()

    // Start with sound enabled but respect browser policies
    v.muted = false
    v.playsInline = true
    v.loop = false
    v.preload = "auto"
    v.crossOrigin = "anonymous"
    v.volume = volume[0] / 100
    v.src = getHeroVideoUrl()

    // Add additional video attributes for better compatibility
    v.setAttribute("webkit-playsinline", "true")
    v.setAttribute("playsinline", "true")

    const tryPlayWithSound = async () => {
      try {
        // Try to play with sound first
        v.muted = false
        await v.play()
        setIsPlaying(true)
        setIsMuted(false)
        setAutoplayBlocked(false)

        toast({
          title: "🎵 Video playing with sound!",
          description: "Enjoy Varsha's birthday celebration with audio",
        })
      } catch (error) {
        console.log("Autoplay with sound blocked, trying muted...")

        try {
          // Fallback to muted autoplay
          v.muted = true
          await v.play()
          setIsPlaying(true)
          setIsMuted(true)
          setAutoplayBlocked(true)

          toast({
            title: "Video playing (muted)",
            description: "Click the 🔊 button to enable sound",
          })
        } catch (mutedError) {
          console.log("All autoplay blocked")
          setIsPlaying(false)
          setAutoplayBlocked(true)

          toast({
            title: "Click to play",
            description: "Your browser requires user interaction to play videos",
          })
        }
      }
    }

    /* ------- listeners ------- */
    const onLoaded = () => {
      setLoading(false)
      tryPlayWithSound()
    }

    const onError = () => {
      setLoading(false)
      setError("Unable to load the video.")
      toast({
        title: "Video load error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    }

    const onEnded = () => {
      setIsPlaying(false)
      setEnded(true)
    }

    const onVolumeChange = () => {
      // Sync state with video element
      setIsMuted(v.muted)
      if (!v.muted) {
        setVolume([Math.round(v.volume * 100)])
      }
    }

    const onPlay = () => {
      setIsPlaying(true)
    }

    const onPause = () => {
      setIsPlaying(false)
    }

    v.addEventListener("loadeddata", onLoaded)
    v.addEventListener("error", onError)
    v.addEventListener("ended", onEnded)
    v.addEventListener("volumechange", onVolumeChange)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)

    return () => {
      v.removeEventListener("loadeddata", onLoaded)
      v.removeEventListener("error", onError)
      v.removeEventListener("ended", onEnded)
      v.removeEventListener("volumechange", onVolumeChange)
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
    }
  }, [toast, volume])

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

  // Enhanced keyboard controls with audio
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
          showVolumeControl()
          break
        case "ArrowDown":
          e.preventDefault()
          const newVolumeDown = Math.max(0, volume[0] - 10)
          changeVolume([newVolumeDown])
          showVolumeControl()
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
        // Number keys for volume (1-9 = 10%-90%, 0 = mute)
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault()
          const volumeLevel = Number.parseInt(e.key) * 10
          changeVolume([volumeLevel])
          showVolumeControl()
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current)
      }
    }
  }, [])

  /* ---------- render ---------- */
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <Card className="overflow-hidden border-4 border-pink-300 shadow-2xl">
        {/* ----- video wrapper ----- */}
        <div className="relative aspect-video bg-black">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-center px-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Reload Page
              </Button>
            </div>
          )}

          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted={isMuted}
            controls={false}
            aria-label="Birthday celebration video for Varsha with audio"
            tabIndex={0}
            role="application"
            aria-describedby="video-description"
            webkit-playsinline="true"
            playsInline={true}
          />

          <div id="video-description" className="sr-only">
            Birthday celebration video with custom controls and audio. Use spacebar to play/pause, arrow keys to seek
            and adjust volume, M to mute, F for fullscreen. Number keys 1-9 set volume to 10%-90%.
          </div>

          {/* Audio indicator */}
          {!isMuted && isPlaying && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <Speaker className="h-4 w-4 text-white animate-pulse" />
              <span className="text-white text-sm font-medium">Audio On</span>
            </div>
          )}

          {/* Autoplay blocked indicator */}
          {autoplayBlocked && !hasUserInteracted && (
            <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Click to play with sound</span>
            </div>
          )}

          {/* Volume slider overlay */}
          {showVolumeSlider && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3 min-w-[200px]">
              <div className="text-white text-sm font-medium">Volume: {volume[0]}%</div>
              <Slider
                value={volume}
                onValueChange={changeVolume}
                max={100}
                step={1}
                className="w-32 cursor-pointer"
                orientation="horizontal"
              />
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <VolumeX className="h-3 w-3" />
                <span>0</span>
                <div className="w-16 h-px bg-white/30"></div>
                <span>100</span>
                <Volume2 className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Refined loading overlay */}
          {loading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-b-3 border-pink-400" />
              <span className="text-white text-sm">Loading video with audio...</span>
            </div>
          )}

          {/* Refined replay / play overlay */}
          {!loading && !isPlaying && !error && (
            <button
              type="button"
              onClick={ended ? replay : togglePlay}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-all duration-300 hover:bg-black/50 group"
            >
              {ended ? (
                <>
                  <RotateCcw className="h-16 w-16 sm:h-20 sm:w-20 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200 mb-2" />
                  <span className="text-white text-sm font-medium">Replay with sound</span>
                </>
              ) : (
                <>
                  <Play className="ml-1 h-16 w-16 sm:h-20 sm:w-20 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200 mb-2" />
                  <span className="text-white text-sm font-medium">
                    {autoplayBlocked ? "Click to play with sound" : "Play"}
                  </span>
                </>
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

              {/* Enhanced control buttons with audio focus */}
              <div className="bg-black/60 backdrop-blur-sm border-t border-white/5">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Play/Pause - optimized size */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
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
                        aria-label="Replay video"
                      >
                        <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    )}

                    {/* Enhanced Mute/Unmute with visual feedback */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      onMouseEnter={showVolumeControl}
                      className={`text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105 ${
                        isMuted ? "bg-red-500/30" : "bg-green-500/30"
                      }`}
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>

                    {/* Enhanced volume slider - more compact */}
                    <div className="hidden sm:block w-16 md:w-20">
                      <Slider
                        max={100}
                        step={1}
                        value={volume}
                        onValueChange={changeVolume}
                        className="cursor-pointer h-2"
                        aria-label="Volume control"
                      />
                    </div>

                    {/* Volume percentage with audio indicator */}
                    <div className="sm:hidden text-white/70 text-xs font-mono min-w-[2.5rem] flex items-center gap-1">
                      {!isMuted && <Speaker className="h-3 w-3" />}
                      {volume[0]}%
                    </div>
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
                          aria-label="Volume control"
                        />
                      </div>
                    </div>

                    {/* Fullscreen - refined */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/15 h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-200 hover:scale-105"
                      aria-label="Toggle fullscreen"
                    >
                      <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced caption with audio mention */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 text-center">
          <h3 className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
            🎊 Birthday Celebration Video 🎊
          </h3>
          <p className="text-sm text-gray-700">Enjoy Varsha&rsquo;s special birthday clip with beautiful sound! 🎵</p>
          {autoplayBlocked && <p className="text-xs text-orange-600 mt-1">Click the play button to start with audio</p>}
        </div>
      </Card>
    </div>
  )
}
