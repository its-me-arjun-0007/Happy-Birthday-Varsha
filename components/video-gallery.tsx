"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  RotateCcw,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { blobAssets } from "@/lib/blob-assets"

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  videoUrl: string
  type?: string
  size?: string // File size for display
}

// Enhanced video data with quality indicators
const videoData: Video[] = [
  {
    id: "1",
    title: "Dance Performance",
    thumbnail: blobAssets.videoThumbnails.thumb1,
    videoUrl: blobAssets.videos.video1,
    type: "video/mp4",
    size: "~15MB",
  },
  {
    id: "2",
    title: "❤️",
    thumbnail: blobAssets.videoThumbnails.thumb2,
    videoUrl: blobAssets.videos.video2,
    type: "video/mp4",
    size: "~12MB",
  },
  {
    id: "3",
    title: "🧡",
    thumbnail: blobAssets.videoThumbnails.thumb3,
    videoUrl: blobAssets.videos.video3,
    type: "video/mp4",
    size: "~18MB",
  },
  {
    id: "4",
    title: "💚",
    thumbnail: blobAssets.videoThumbnails.thumb4,
    videoUrl: blobAssets.videos.video4,
    type: "video/mp4",
    size: "~14MB",
  },
  {
    id: "5",
    title: "💙",
    thumbnail: blobAssets.videoThumbnails.thumb5,
    videoUrl: blobAssets.videos.video5,
    type: "video/mp4",
    size: "~20MB",
  },
  {
    id: "6",
    title: "💜",
    thumbnail: blobAssets.videoThumbnails.thumb6,
    videoUrl: blobAssets.videos.video6,
    type: "video/mp4",
    size: "~16MB",
  },
]

// Network quality detection
const useNetworkQuality = () => {
  const [networkQuality, setNetworkQuality] = useState<"fast" | "slow" | "offline">("fast")
  const [connectionType, setConnectionType] = useState<string>("unknown")

  useEffect(() => {
    // Check if Network Information API is available
    if ("connection" in navigator) {
      const connection = (navigator as any).connection

      const updateConnectionInfo = () => {
        setConnectionType(connection.effectiveType || "unknown")

        // Determine quality based on effective connection type
        if (connection.effectiveType === "4g") {
          setNetworkQuality("fast")
        } else if (connection.effectiveType === "3g" || connection.effectiveType === "2g") {
          setNetworkQuality("slow")
        } else {
          setNetworkQuality("fast") // Default to fast for unknown
        }
      }

      updateConnectionInfo()
      connection.addEventListener("change", updateConnectionInfo)

      return () => {
        connection.removeEventListener("change", updateConnectionInfo)
      }
    }

    // Fallback: Simple network speed test
    const testNetworkSpeed = async () => {
      try {
        const startTime = Date.now()
        await fetch("/placeholder.svg?cache=" + Math.random(), {
          method: "HEAD",
          cache: "no-cache",
        })
        const endTime = Date.now()
        const duration = endTime - startTime

        setNetworkQuality(duration < 500 ? "fast" : "slow")
      } catch {
        setNetworkQuality("offline")
      }
    }

    testNetworkSpeed()
  }, [])

  return { networkQuality, connectionType }
}

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([75])
  const [currentTime, setCurrentTime] = useState([0])
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [bufferProgress, setBufferProgress] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [playbackQuality, setPlaybackQuality] = useState<"auto" | "high" | "medium" | "low">("auto")
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set())

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { toast } = useToast()
  const { networkQuality, connectionType } = useNetworkQuality()

  // Preload next/previous videos based on network quality
  const preloadAdjacentVideos = useCallback(() => {
    if (!selectedVideo || networkQuality === "slow") return

    const currentIndex = videoData.findIndex((v) => v.id === selectedVideo.id)
    const videosToPreload = []

    // Preload next video
    if (currentIndex < videoData.length - 1) {
      videosToPreload.push(videoData[currentIndex + 1])
    }
    // Preload previous video
    if (currentIndex > 0) {
      videosToPreload.push(videoData[currentIndex - 1])
    }

    videosToPreload.forEach((video) => {
      if (!preloadedVideos.has(video.id)) {
        const preloadVideo = document.createElement("video")
        preloadVideo.preload = "metadata"
        preloadVideo.src = video.videoUrl
        preloadVideo.load()

        preloadVideo.addEventListener("loadedmetadata", () => {
          setPreloadedVideos((prev) => new Set([...prev, video.id]))
        })
      }
    })
  }, [selectedVideo, networkQuality, preloadedVideos])

  // Enhanced video initialization with buffering optimization
  useEffect(() => {
    const video = videoRef.current
    if (!video || !selectedVideo) return

    setIsLoading(true)
    setIsBuffering(false)
    setHasError(false)
    setIsVideoReady(false)
    setErrorMessage("")
    setBufferProgress(0)

    // Reset video state
    video.currentTime = 0
    setCurrentTime([0])
    setIsPlaying(false)

    // Configure video for optimal buffering
    video.preload = networkQuality === "fast" ? "auto" : "metadata"
    video.crossOrigin = "anonymous"

    // Set video source
    video.src = selectedVideo.videoUrl
    video.load()

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
      setIsLoading(false)
      setIsVideoReady(true)
      console.log("Video metadata loaded:", {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        networkType: connectionType,
      })
    }

    const handleTimeUpdate = () => {
      setCurrentTime([video.currentTime || 0])

      // Update buffer progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const progress = (bufferedEnd / video.duration) * 100
        setBufferProgress(progress)
      }
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const progress = (bufferedEnd / video.duration) * 100
        setBufferProgress(progress)
      }
    }

    const handleWaiting = () => {
      setIsBuffering(true)
      console.log("Video buffering...")
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setIsBuffering(false)
      setIsVideoReady(true)
      console.log("Video can play")
    }

    const handleCanPlayThrough = () => {
      setIsLoading(false)
      setIsBuffering(false)
      console.log("Video can play through")
    }

    const handleStalled = () => {
      setIsBuffering(true)
      console.log("Video stalled - network issue detected")

      toast({
        title: "Buffering",
        description: "Video is loading. This may take a moment on slower connections.",
      })
    }

    const handleSuspend = () => {
      console.log("Video loading suspended")
    }

    const handleEnded = () => {
      setIsPlaying(false)
      goToNextVideo()
    }

    const handleError = (e: Event) => {
      const error = video.error
      let message = "Unknown video error"

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = "Video playback was aborted"
            break
          case MediaError.MEDIA_ERR_NETWORK:
            message = "Network error - check your internet connection"
            break
          case MediaError.MEDIA_ERR_DECODE:
            message = "Video format not supported or corrupted"
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = "Video format or codec not supported"
            break
          default:
            message = `Video error (code: ${error.code})`
        }
      }

      console.error("Video error:", error, e)
      setIsLoading(false)
      setIsBuffering(false)
      setHasError(true)
      setErrorMessage(message)
      setIsVideoReady(false)

      toast({
        title: "Video Error",
        description: message,
        variant: "destructive",
      })
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setIsBuffering(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    // Add all event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("progress", handleProgress)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("canplaythrough", handleCanPlayThrough)
    video.addEventListener("stalled", handleStalled)
    video.addEventListener("suspend", handleSuspend)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    // Set volume
    video.volume = volume[0] / 100
    video.muted = isMuted

    // Preload adjacent videos after a delay
    const preloadTimer = setTimeout(preloadAdjacentVideos, 2000)

    return () => {
      // Cleanup event listeners
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("progress", handleProgress)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("canplaythrough", handleCanPlayThrough)
      video.removeEventListener("stalled", handleStalled)
      video.removeEventListener("suspend", handleSuspend)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("error", handleError)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)

      clearTimeout(preloadTimer)
    }
  }, [selectedVideo, networkQuality, connectionType])

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume[0] / 100
      video.muted = isMuted
    }
  }, [volume, isMuted])

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setCurrentTime([0])
    setIsPlaying(false)
    setBufferProgress(0)
  }

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video || !isVideoReady) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        // Check if enough video is buffered before playing
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1)
          const currentTime = video.currentTime

          // If we don't have enough buffer ahead, show buffering state
          if (bufferedEnd - currentTime < 5 && networkQuality === "slow") {
            setIsBuffering(true)
            toast({
              title: "Buffering",
              description: "Loading more video data for smooth playback...",
            })
          }
        }

        await video.play()
      }
    } catch (error) {
      console.error("Play/pause error:", error)
      toast({
        title: "Playback Error",
        description: "Unable to play video. Please check your connection and try again.",
        variant: "destructive",
      })
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (video && isVideoReady) {
      const seekTime = value[0]

      // Check if we're seeking to an unbuffered area
      let isBuffered = false
      for (let i = 0; i < video.buffered.length; i++) {
        if (seekTime >= video.buffered.start(i) && seekTime <= video.buffered.end(i)) {
          isBuffered = true
          break
        }
      }

      if (!isBuffered && networkQuality === "slow") {
        setIsBuffering(true)
        toast({
          title: "Seeking",
          description: "Loading video at new position...",
        })
      }

      video.currentTime = seekTime
      setCurrentTime(value)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (value[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const skipForward = () => {
    const video = videoRef.current
    if (video && isVideoReady) {
      const newTime = Math.min(video.currentTime + 10, duration)
      video.currentTime = newTime
      setCurrentTime([newTime])
    }
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (video && isVideoReady) {
      const newTime = Math.max(video.currentTime - 10, 0)
      video.currentTime = newTime
      setCurrentTime([newTime])
    }
  }

  const restartVideo = () => {
    const video = videoRef.current
    if (video && isVideoReady) {
      video.currentTime = 0
      setCurrentTime([0])
      if (!isPlaying) {
        video.play().catch(console.error)
      }
    }
  }

  const goToNextVideo = () => {
    if (!selectedVideo) return
    const currentIndex = videoData.findIndex((v) => v.id === selectedVideo.id)
    const nextIndex = (currentIndex + 1) % videoData.length
    handleVideoSelect(videoData[nextIndex])
  }

  const goToPreviousVideo = () => {
    if (!selectedVideo) return
    const currentIndex = videoData.findIndex((v) => v.id === selectedVideo.id)
    const prevIndex = (currentIndex - 1 + videoData.length) % videoData.length
    handleVideoSelect(videoData[prevIndex])
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

  const getNetworkIcon = () => {
    switch (networkQuality) {
      case "fast":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "slow":
        return <Wifi className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />
    }
  }

  const getQualityRecommendation = () => {
    if (networkQuality === "slow") {
      return "Consider switching to a faster connection for better video quality"
    }
    return `Connection: ${connectionType.toUpperCase()} - Optimal for video streaming`
  }

  return (
    <div className="space-y-6">
      {/* Network Status Indicator */}
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getNetworkIcon()}
              <span className="font-medium">Network Status</span>
            </div>
            <div className="text-gray-600">{getQualityRecommendation()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      {selectedVideo && (
        <Card className="border-2 border-pink-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative bg-black aspect-video">
              {hasError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <div>
                      <div className="text-xl font-bold mb-2">Video Error</div>
                      <div className="text-sm opacity-80">{errorMessage}</div>
                      <Button
                        variant="outline"
                        className="mt-4 text-white border-white hover:bg-white hover:text-black bg-transparent"
                        onClick={() => handleVideoSelect(selectedVideo)}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                    preload={networkQuality === "fast" ? "auto" : "metadata"}
                    playsInline
                    poster={selectedVideo.thumbnail}
                  >
                    <source src={selectedVideo.videoUrl} type={selectedVideo.type || "video/mp4"} />
                    Your browser does not support the video tag.
                  </video>

                  {/* Loading/Buffering Overlay */}
                  {(isLoading || isBuffering) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <div className="text-lg">{isLoading ? "Loading video..." : "Buffering..."}</div>
                        {bufferProgress > 0 && (
                          <div className="mt-2 text-sm opacity-80">Buffer: {Math.round(bufferProgress)}%</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Buffer Progress Indicator */}
                  {bufferProgress > 0 && bufferProgress < 100 && !isLoading && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Buffer: {Math.round(bufferProgress)}%
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Enhanced Video Controls */}
            <div className="bg-gray-900 text-white p-4 space-y-4">
              {/* Progress Bar with Buffer Indicator */}
              <div className="space-y-2">
                <div className="relative">
                  {/* Buffer progress background */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gray-600 rounded"
                    style={{ width: `${bufferProgress}%` }}
                  />
                  {/* Main progress slider */}
                  <Slider
                    value={currentTime}
                    onValueChange={handleSeek}
                    max={duration || 100}
                    step={1}
                    className="w-full relative z-10"
                    disabled={!isVideoReady}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime[0])}</span>
                  <div className="flex items-center gap-2">
                    {isBuffering && <span className="text-yellow-400">Buffering...</span>}
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousVideo}
                    className="text-white hover:bg-gray-700"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipBackward}
                    className="text-white hover:bg-gray-700"
                    disabled={!isVideoReady}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="ml-1 text-xs">10s</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-gray-700"
                    disabled={!isVideoReady || isLoading}
                  >
                    {isLoading || isBuffering ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={restartVideo}
                    className="text-white hover:bg-gray-700"
                    disabled={!isVideoReady}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-white hover:bg-gray-700"
                    disabled={!isVideoReady}
                  >
                    <span className="mr-1 text-xs">10s</span>
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={goToNextVideo} className="text-white hover:bg-gray-700">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-gray-700"
                    disabled={!isVideoReady}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <div className="w-20">
                    <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-gray-700"
                    disabled={!isVideoReady}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold">{selectedVideo.title}</h3>
                <div className="flex items-center justify-center gap-4 mt-1 text-xs text-gray-400">
                  <span>{selectedVideo.type || "video/mp4"}</span>
                  <span>{selectedVideo.size}</span>
                  {isVideoReady && <span>Ready to play</span>}
                  {preloadedVideos.has(selectedVideo.id) && (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                      Preloaded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoData.map((video) => (
          <Card
            key={video.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
              selectedVideo?.id === video.id ? "border-pink-400 shadow-lg" : "border-pink-200 hover:border-pink-300"
            }`}
            onClick={() => handleVideoSelect(video)}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  loading="lazy"
                  style={{
                    aspectRatio: "16/9",
                    objectPosition: "center",
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                  <Play className="h-12 w-12 text-white drop-shadow-lg" />
                </div>

                {/* File size badge */}
                <Badge className="absolute top-2 right-2 bg-black/70 text-white backdrop-blur-sm text-xs">
                  {video.size}
                </Badge>

                {/* Status badges */}
                {selectedVideo?.id === video.id && (
                  <Badge className="absolute top-2 left-2 bg-pink-500 text-white backdrop-blur-sm">
                    {isPlaying ? "Playing" : "Selected"}
                  </Badge>
                )}

                {preloadedVideos.has(video.id) && selectedVideo?.id !== video.id && (
                  <Badge className="absolute bottom-2 left-2 bg-green-500 text-white backdrop-blur-sm text-xs">
                    Preloaded
                  </Badge>
                )}

                {/* Gradient overlay for better text readability */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16 rounded-t-lg"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{video.type || "video/mp4"}</span>
                  <span>{video.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videoData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No videos available.</p>
        </div>
      )}

      {/* Enhanced Instructions */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-blue-700">
              🎬 Click on any video to start playing. Videos are optimized based on your connection speed.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• Fast connections: Videos preload automatically for smooth playback</p>
              <p>• Slower connections: Videos load on-demand to save bandwidth</p>
              <p>• Buffer indicator shows loading progress for better experience</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
