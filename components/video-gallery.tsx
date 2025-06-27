"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, RotateCcw, AlertCircle } from "lucide-react"
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
}

const videoData: Video[] = [
  {
    id: "1",
    title: "Dance Performance",
    thumbnail: blobAssets.videoThumbnails.thumb1,
    // duration: "2:45",
    videoUrl: blobAssets.videos.video1,
    type: "video/mp4",
  },
  {
    id: "2",
    title: "❤️",
    thumbnail: blobAssets.videoThumbnails.thumb2,
    // duration: "1:30",
    videoUrl: blobAssets.videos.video2,
    type: "video/mp4",
  },
  {
    id: "3",
    title: "🧡",
    thumbnail: blobAssets.videoThumbnails.thumb3,
    // duration: "3:20",
    videoUrl: blobAssets.videos.video3,
    type: "video/mp4",
  },
  {
    id: "4",
    title: "💚",
    thumbnail: blobAssets.videoThumbnails.thumb4,
    // duration: "2:15",
    videoUrl: blobAssets.videos.video4,
    type: "video/mp4",
  },
  {
    id: "5",
    title: "💙",
    thumbnail: blobAssets.videoThumbnails.thumb5,
    // duration: "4:10",
    videoUrl: blobAssets.videos.video5,
    type: "video/mp4",
  },
  {
    id: "6",
    title: "💜",
    thumbnail: blobAssets.videoThumbnails.thumb6,
    // duration: "5:30",
    videoUrl: blobAssets.videos.video6,
    type: "video/mp4",
  },
]

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([75])
  const [currentTime, setCurrentTime] = useState([0])
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isVideoReady, setIsVideoReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { toast } = useToast()

  // Initialize video element and event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video || !selectedVideo) return

    setIsLoading(true)
    setHasError(false)
    setIsVideoReady(false)
    setErrorMessage("")

    // Reset video state
    video.currentTime = 0
    setCurrentTime([0])
    setIsPlaying(false)

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
      })
    }

    const handleTimeUpdate = () => {
      setCurrentTime([video.currentTime || 0])
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
            message = "Network error occurred while loading video"
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
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setIsVideoReady(true)
      console.log("Video can play")
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleCanPlayThrough = () => {
      setIsLoading(false)
      console.log("Video can play through")
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplaythrough", handleCanPlayThrough)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    // Set volume
    video.volume = volume[0] / 100
    video.muted = isMuted

    return () => {
      // Cleanup event listeners
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("error", handleError)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplaythrough", handleCanPlayThrough)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [selectedVideo])

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
  }

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video || !isVideoReady) return

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
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (video && isVideoReady) {
      video.currentTime = value[0]
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

  return (
    <div className="space-y-6">
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
                        className="mt-4 text-white border-white hover:bg-white hover:text-black"
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
                    preload="metadata"
                    playsInline
                  >
                    <source src={selectedVideo.videoUrl} type={selectedVideo.type || "video/mp4"} />
                    Your browser does not support the video tag.
                  </video>

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <div className="text-lg">Loading video...</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Video Controls */}
            <div className="bg-gray-900 text-white p-4 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={currentTime}
                  onValueChange={handleSeek}
                  max={duration || 100}
                  step={1}
                  className="w-full"
                  disabled={!isVideoReady}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime[0])}</span>
                  <span>{formatTime(duration)}</span>
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
                    {isLoading ? (
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
                {isVideoReady && (
                  <p className="text-xs text-gray-400 mt-1">{selectedVideo.type || "video/mp4"} • Ready to play</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
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
                <Badge className="absolute top-2 right-2 bg-black/70 text-white backdrop-blur-sm">
                  {video.duration}
                </Badge>
                {selectedVideo?.id === video.id && (
                  <Badge className="absolute top-2 left-2 bg-pink-500 text-white backdrop-blur-sm">
                    {isPlaying ? "Playing" : "Selected"}
                  </Badge>
                )}

                {/* Gradient overlay for better text readability */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16 rounded-t-lg"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-xs text-gray-500">{video.type || "video/mp4"}</p>
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

      {/* Instructions */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-blue-700">
            🎬 Click on any video to start playing. Use the controls to navigate through the playlist.
            <br />
            <span className="text-xs">
              Supported formats: MP4, WebM, OGG • Make sure your browser supports HTML5 video
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
