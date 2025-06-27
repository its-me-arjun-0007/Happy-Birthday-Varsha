"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { getHeroVideoUrl } from "@/lib/blob-assets"

export default function HeroVideo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false) // Start unmuted for sound
  const [volume, setVolume] = useState([75])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = false // Allow sound by default
    video.playsInline = true
    video.loop = false // Remove looping
    video.crossOrigin = "anonymous"
    video.preload = "auto"

    const handleLoadedMetadata = () => {
      setIsLoading(false)
      setIsVideoReady(true)

      // Attempt autoplay with sound
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.log("Autoplay with sound blocked, trying muted:", error)
            // If autoplay with sound fails, try muted autoplay
            video.muted = true
            setIsMuted(true)
            video
              .play()
              .then(() => {
                setIsPlaying(true)
                toast({
                  title: "🎬 Video Playing",
                  description: "Click the volume button to unmute and hear the sound!",
                })
              })
              .catch(() => {
                setIsPlaying(false)
                toast({
                  title: "🎬 Video Ready",
                  description: "Click to play Varsha's special video with sound!",
                })
              })
          })
      }
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setIsVideoReady(true)
    }

    const handleError = (e: Event) => {
      const error = video.error
      let message = "Unable to play video"

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = "Video playback was interrupted"
            break
          case MediaError.MEDIA_ERR_NETWORK:
            message = "Network error - please check your connection"
            break
          case MediaError.MEDIA_ERR_DECODE:
            message = "Video format not supported by your browser"
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = "Video format not supported"
            break
          default:
            message = `Playback error (code: ${error.code})`
        }
      }

      console.error("Video error:", error, e)
      setIsLoading(false)
      setHasError(true)
      setIsVideoReady(false)

      toast({
        title: "Video Error",
        description: message + " - Please try refreshing the page.",
        variant: "destructive",
      })
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setHasEnded(false)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setHasEnded(true)
      toast({
        title: "🎬 Video Finished",
        description: "Click play to watch again!",
      })
    }

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    // Set video source
    video.src = getHeroVideoUrl()
    video.load()

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume[0] / 100
      video.muted = isMuted
    }
  }, [volume, isMuted])

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video || !isVideoReady) return

    setHasUserInteracted(true)

    try {
      if (isPlaying) {
        video.pause()
      } else {
        await video.play()
      }
    } catch (error) {
      console.error("Play/pause error:", error)
      toast({
        title: "Playback Error",
        description: "Unable to play video. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setHasUserInteracted(true)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (value[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
    setHasUserInteracted(true)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error)
    } else {
      video.requestFullscreen().catch(console.error)
    }
  }

  const replayVideo = async () => {
    const video = videoRef.current
    if (!video || !isVideoReady) return

    video.currentTime = 0
    setHasEnded(false)
    setHasUserInteracted(true)

    try {
      await video.play()
    } catch (error) {
      console.error("Replay error:", error)
    }
  }

  const handleVideoClick = () => {
    if (hasEnded) {
      replayVideo()
    } else if (!hasUserInteracted) {
      togglePlayPause()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (hasEnded) {
      replayVideo()
    } else {
      togglePlayPause()
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video && !isMuted) {
      // Simple audio level detection
      const updateAudioLevel = () => {
        if (video.volume > 0 && !video.muted) {
          setAudioLevel(video.volume * 100)
        } else {
          setAudioLevel(0)
        }
      }

      video.addEventListener("volumechange", updateAudioLevel)
      return () => video.removeEventListener("volumechange", updateAudioLevel)
    }
  }, [isMuted])

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <Card className="overflow-hidden border-4 border-pink-300 shadow-2xl bg-gradient-to-br from-pink-100 to-purple-100">
        <div
          ref={containerRef}
          className="relative bg-black aspect-video cursor-pointer group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onClick={handleVideoClick}
          onTouchStart={handleTouchStart}
        >
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                <div>
                  <div className="text-2xl font-bold mb-2">Video Unavailable</div>
                  <div className="text-sm opacity-80">Unable to load the video</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                crossOrigin="anonymous"
                poster="/placeholder.svg?height=400&width=800"
              >
                <source src={getHeroVideoUrl()} type="video/mp4" />
                <source src={getHeroVideoUrl()} type="video/webm" />
                Your browser does not support the video tag. Please try a different browser.
              </video>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-400 mx-auto mb-4"></div>
                    <div className="text-xl font-semibold">Loading Varsha's Special Video...</div>
                  </div>
                </div>
              )}

              {/* Play Overlay for Non-Playing State */}
              {!isPlaying && isVideoReady && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-all transform hover:scale-110">
                    {hasEnded ? (
                      <div className="text-center">
                        <RotateCcw className="h-16 w-16 text-white drop-shadow-2xl mx-auto mb-2" />
                        <div className="text-white text-sm font-medium">Replay</div>
                      </div>
                    ) : (
                      <Play className="h-16 w-16 text-white drop-shadow-2xl ml-2" />
                    )}
                  </div>
                </div>
              )}

              {/* Video Controls Overlay */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                  showControls || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Gradient Overlay for Better Control Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

                {/* Control Buttons */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
                  <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlayPause()
                        }}
                        className="text-white hover:bg-white/20 h-12 w-12 rounded-full"
                        disabled={!isVideoReady}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-1" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMute()
                        }}
                        className="text-white hover:bg-white/20"
                        disabled={!isVideoReady}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>

                      <div className="w-20 hidden sm:block">
                        <Slider
                          value={volume}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {audioLevel > 0 && (
                          <div className="text-xs text-white/60 text-center mt-1">{Math.round(audioLevel)}%</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!hasUserInteracted && (
                        <div className="hidden sm:block text-white/80 text-sm bg-pink-500/80 px-3 py-1 rounded-full">
                          Click to play with sound
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFullscreen()
                        }}
                        className="text-white hover:bg-white/20"
                        disabled={!isVideoReady}
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Video Title Overlay */}
                <div className="absolute top-4 left-4 right-4 pointer-events-none">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
                    <h3 className="text-white text-lg sm:text-xl font-bold">
                      🎬 Special Video for Varsha's Birthday! 🎉
                    </h3>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Video Description Card */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-t-2 border-pink-200">
          <div className="text-center space-y-2">
            <h4 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              🎊 Birthday Celebration Video 🎊
            </h4>
            <p className="text-gray-700 text-sm">
              Watch this special video created just for Varsha's birthday celebration with sound!
              {!hasUserInteracted && (
                <span className="text-pink-600 font-medium"> Click to play with audio for the full experience.</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Responsive Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">💡 Best experienced with sound on • Optimized for all devices</p>
      </div>
    </div>
  )
}
