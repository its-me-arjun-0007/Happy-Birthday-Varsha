"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blobAssets } from "@/lib/blob-assets"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  thumbnail: string
  videoUrl: string
  username: string
  avatar: string
  description: string
  hashtags: string[]
  likes: number
  comments: number
  shares: number
  duration: number
  isVerified?: boolean
}

// Enhanced video data with Instagram-like metadata
const videoData: Video[] = [
  {
    id: "1",
    title: "Dance Performance",
    thumbnail: blobAssets.videoThumbnails.thumb1,
    videoUrl: blobAssets.videos.video1,
    username: "varsha_dancer",
    avatar: blobAssets.videoThumbnails.thumb1,
    description: "Amazing dance moves that will make your day! ✨",
    hashtags: ["#dance", "#performance", "#amazing", "#talent"],
    likes: 1247,
    comments: 89,
    shares: 34,
    duration: 30,
    isVerified: true,
  },
  {
    id: "2",
    title: "Beautiful Moments",
    thumbnail: blobAssets.videoThumbnails.thumb2,
    videoUrl: blobAssets.videos.video2,
    username: "varsha_official",
    avatar: blobAssets.videoThumbnails.thumb2,
    description: "Capturing beautiful moments that matter ❤️ #blessed",
    hashtags: ["#beautiful", "#moments", "#blessed", "#happy"],
    likes: 2156,
    comments: 145,
    shares: 67,
    duration: 25,
    isVerified: true,
  },
  {
    id: "3",
    title: "Sunshine Vibes",
    thumbnail: blobAssets.videoThumbnails.thumb3,
    videoUrl: blobAssets.videos.video3,
    username: "sunshine_varsha",
    avatar: blobAssets.videoThumbnails.thumb3,
    description: "Spreading sunshine wherever I go! 🌞 Good vibes only",
    hashtags: ["#sunshine", "#goodvibes", "#positive", "#energy"],
    likes: 3421,
    comments: 267,
    shares: 123,
    duration: 35,
  },
  {
    id: "4",
    title: "Nature Beauty",
    thumbnail: blobAssets.videoThumbnails.thumb4,
    videoUrl: blobAssets.videos.video4,
    username: "nature_varsha",
    avatar: blobAssets.videoThumbnails.thumb4,
    description: "Finding peace in nature's embrace 🌿 #naturelover",
    hashtags: ["#nature", "#peace", "#green", "#mindfulness"],
    likes: 1876,
    comments: 134,
    shares: 78,
    duration: 28,
  },
  {
    id: "5",
    title: "Ocean Dreams",
    thumbnail: blobAssets.videoThumbnails.thumb5,
    videoUrl: blobAssets.videos.video5,
    username: "ocean_dreams_v",
    avatar: blobAssets.videoThumbnails.thumb5,
    description: "Lost in ocean dreams and endless possibilities 🌊",
    hashtags: ["#ocean", "#dreams", "#blue", "#infinite"],
    likes: 4567,
    comments: 312,
    shares: 189,
    duration: 32,
    isVerified: true,
  },
  {
    id: "6",
    title: "Purple Magic",
    thumbnail: blobAssets.videoThumbnails.thumb6,
    videoUrl: blobAssets.videos.video6,
    username: "purple_magic_v",
    avatar: blobAssets.videoThumbnails.thumb6,
    description: "When purple meets magic, miracles happen ✨💜",
    hashtags: ["#purple", "#magic", "#miracle", "#aesthetic"],
    likes: 5234,
    comments: 445,
    shares: 234,
    duration: 40,
  },
]

export default function VideoGallery() {
  // State management
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({})
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const currentVideo = videoData[currentVideoIndex]

  // Initialize video refs
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videoData.length)
  }, [])

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setShowControls(true)
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  // Handle video intersection and autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement
          const videoIndex = videoRefs.current.indexOf(videoElement)

          if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
            setCurrentVideoIndex(videoIndex)
            if (videoElement && videoElement.paused) {
              videoElement.play().catch(() => {})
            }
          } else {
            if (videoElement && !videoElement.paused) {
              videoElement.pause()
            }
          }
        })
      },
      {
        threshold: [0.8],
        rootMargin: "-5% 0px -5% 0px",
      },
    )

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [])

  // Handle video events
  const setupVideoEvents = useCallback(
    (video: HTMLVideoElement, index: number) => {
      const handleTimeUpdate = () => {
        if (index === currentVideoIndex) {
          const current = video.currentTime
          const total = video.duration
          setCurrentTime(current)
          setVideoProgress((prev) => ({
            ...prev,
            [videoData[index].id]: (current / total) * 100,
          }))
        }
      }

      const handleLoadedMetadata = () => {
        if (index === currentVideoIndex) {
          setDuration(video.duration)
        }
      }

      const handleEnded = () => {
        if (index === currentVideoIndex) {
          setIsPlaying(false)
          if (index < videoData.length - 1) {
            setTimeout(() => scrollToVideo(index + 1), 500)
          }
        }
      }

      const handlePlay = () => {
        if (index === currentVideoIndex) {
          setIsPlaying(true)
          setIsLoading(false)
          setIsBuffering(false)
        }
      }

      const handlePause = () => {
        if (index === currentVideoIndex) {
          setIsPlaying(false)
        }
      }

      const handleWaiting = () => {
        if (index === currentVideoIndex) {
          setIsBuffering(true)
        }
      }

      const handleCanPlay = () => {
        if (index === currentVideoIndex) {
          setIsLoading(false)
          setIsBuffering(false)
        }
      }

      const handleLoadStart = () => {
        if (index === currentVideoIndex) {
          setIsLoading(true)
        }
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("ended", handleEnded)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)
      video.addEventListener("waiting", handleWaiting)
      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("loadstart", handleLoadStart)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("ended", handleEnded)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
        video.removeEventListener("waiting", handleWaiting)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("loadstart", handleLoadStart)
      }
    },
    [currentVideoIndex],
  )

  // Setup video events
  useEffect(() => {
    const cleanups: Array<() => void> = []

    videoRefs.current.forEach((videoEl, idx) => {
      if (videoEl) {
        cleanups.push(setupVideoEvents(videoEl, idx))
      }
    })

    return () => {
      cleanups.forEach((fn) => fn && fn())
    }
  }, [setupVideoEvents])

  // Scroll to specific video
  const scrollToVideo = (index: number) => {
    const container = containerRef.current
    if (container && index >= 0 && index < videoData.length) {
      const targetY = index * window.innerHeight
      container.scrollTo({
        top: targetY,
        behavior: "smooth",
      })
    }
  }

  // Handle play/pause
  const togglePlayPause = () => {
    const video = videoRefs.current[currentVideoIndex]
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play().catch(() => {
          toast({
            title: "Playback Error",
            description: "Unable to play video. Please try again.",
            variant: "destructive",
          })
        })
      }
    }
    resetControlsTimeout()
  }

  // Handle mute/unmute
  const toggleMute = () => {
    const video = videoRefs.current[currentVideoIndex]
    if (video) {
      video.muted = !isMuted
      setIsMuted(video.muted)
    }
    resetControlsTimeout()
  }

  // Format numbers (Instagram style)
  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  // Handle like
  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(videoId)) {
        newLiked.delete(videoId)
      } else {
        newLiked.add(videoId)
        // Heart animation effect
        const heartElements = document.querySelectorAll("[data-heart-animation]")
        heartElements.forEach((el) => {
          el.classList.add("animate-ping")
          setTimeout(() => el.classList.remove("animate-ping"), 600)
        })
      }
      return newLiked
    })
    resetControlsTimeout()
  }

  // Handle save
  const toggleSave = (videoId: string) => {
    setSavedVideos((prev) => {
      const newSaved = new Set(prev)
      if (newSaved.has(videoId)) {
        newSaved.delete(videoId)
        toast({
          title: "Removed from saved",
          description: "Video removed from your collection",
        })
      } else {
        newSaved.add(videoId)
        toast({
          title: "Saved!",
          description: "Video added to your collection",
        })
      }
      return newSaved
    })
    resetControlsTimeout()
  }

  // Handle share
  const handleShare = async (video: Video) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${video.username}'s video`,
          text: video.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Video link copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Share",
          description: "Unable to share at this time",
          variant: "destructive",
        })
      }
    }
    resetControlsTimeout()
  }

  // Handle comment
  const handleComment = (video: Video) => {
    toast({
      title: "Comments",
      description: `View ${formatCount(video.comments)} comments`,
    })
    resetControlsTimeout()
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
    setIsDragging(true)
    resetControlsTimeout()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touchY = e.touches[0].clientY
    const diff = touchStartY - touchY

    // Prevent default scrolling for small movements
    if (Math.abs(diff) > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentVideoIndex < videoData.length - 1) {
        // Swipe up - next video
        scrollToVideo(currentVideoIndex + 1)
      } else if (diff < 0 && currentVideoIndex > 0) {
        // Swipe down - previous video
        scrollToVideo(currentVideoIndex - 1)
      }
    }

    setIsDragging(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlayPause()
          break
        case "ArrowUp":
          e.preventDefault()
          if (currentVideoIndex > 0) {
            scrollToVideo(currentVideoIndex - 1)
          }
          break
        case "ArrowDown":
          e.preventDefault()
          if (currentVideoIndex < videoData.length - 1) {
            scrollToVideo(currentVideoIndex + 1)
          }
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "l":
          e.preventDefault()
          toggleLike(currentVideo.id)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentVideoIndex, isPlaying, isMuted, currentVideo])

  // Mouse movement handler
  const handleMouseMove = () => {
    resetControlsTimeout()
  }

  // Initialize controls timeout
  useEffect(() => {
    resetControlsTimeout()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [resetControlsTimeout])

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videoData.map((video, index) => (
          <div key={video.id} className="relative w-full h-screen snap-start flex items-center justify-center bg-black">
            {/* Video Element */}
            <video
              ref={(el) => {
                videoRefs.current[index] = el
              }}
              className="w-full h-full object-cover"
              src={video.videoUrl}
              poster={video.thumbnail}
              muted={isMuted}
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              loop
            />

            {/* Progress Bars (Instagram Style) */}
            <div className="absolute top-2 left-4 right-4 z-30 flex space-x-1">
              {videoData.map((_, progressIndex) => (
                <div key={progressIndex} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{
                      width:
                        progressIndex === currentVideoIndex
                          ? `${videoProgress[video.id] || 0}%`
                          : progressIndex < currentVideoIndex
                            ? "100%"
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Loading/Buffering Overlay */}
            {(isLoading || isBuffering) && index === currentVideoIndex && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center" onClick={togglePlayPause}>
              {!isPlaying && index === currentVideoIndex && !isLoading && !isBuffering && (
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              )}
            </div>

            {/* User Info & Description (Bottom Left) */}
            <div
              className={`absolute bottom-0 left-0 right-20 z-20 p-4 transition-all duration-300 ${
                showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="space-y-3">
                {/* User Avatar & Name */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={video.avatar || "/placeholder.svg"}
                      alt={video.username}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-sm">{video.username}</span>
                    {video.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-3 text-xs font-semibold border-white text-white bg-transparent hover:bg-white hover:text-black"
                    >
                      Follow
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <p className="text-white text-sm leading-relaxed pr-4">{video.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {video.hashtags.map((hashtag, hashIndex) => (
                      <span key={hashIndex} className="text-blue-300 text-sm hover:underline cursor-pointer">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Video Stats */}
                <div className="flex items-center space-x-4 text-white/70 text-xs">
                  <span>{formatCount(video.likes)} likes</span>
                  <span>•</span>
                  <span>{formatCount(video.comments)} comments</span>
                  <span>•</span>
                  <span>{video.duration}s</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Right Side - Instagram Style) */}
            <div
              className={`absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-6 transition-all duration-300 ${
                showControls || !isPlaying ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
            >
              {/* Like Button */}
              <button
                onClick={() => toggleLike(video.id)}
                className="flex flex-col items-center space-y-1 group"
                data-heart-animation
              >
                <div className="relative">
                  <Heart
                    className={`w-7 h-7 transition-all duration-200 ${
                      likedVideos.has(video.id)
                        ? "text-red-500 fill-red-500 scale-110"
                        : "text-white group-hover:scale-110"
                    }`}
                  />
                  {likedVideos.has(video.id) && (
                    <div className="absolute inset-0 animate-ping">
                      <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                    </div>
                  )}
                </div>
                <span className="text-white text-xs font-medium">
                  {formatCount((video.likes || 0) + (likedVideos.has(video.id) ? 1 : 0))}
                </span>
              </button>

              {/* Comment Button */}
              <button onClick={() => handleComment(video)} className="flex flex-col items-center space-y-1 group">
                <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
                <span className="text-white text-xs font-medium">{formatCount(video.comments || 0)}</span>
              </button>

              {/* Share Button */}
              <button onClick={() => handleShare(video)} className="flex flex-col items-center space-y-1 group">
                <Send className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
                <span className="text-white text-xs font-medium">{formatCount(video.shares || 0)}</span>
              </button>

              {/* Save Button */}
              <button onClick={() => toggleSave(video.id)} className="flex flex-col items-center space-y-1 group">
                <Bookmark
                  className={`w-6 h-6 transition-all duration-200 ${
                    savedVideos.has(video.id) ? "text-yellow-500 fill-yellow-500" : "text-white group-hover:scale-110"
                  }`}
                />
              </button>

              {/* More Options */}
              <button className="flex flex-col items-center space-y-1 group">
                <MoreHorizontal className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Volume Control (Bottom Right) */}
            <div
              className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all duration-200"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
            </div>

            {/* Navigation Hints */}
            {index > 0 && (
              <button
                onClick={() => scrollToVideo(index - 1)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-20 hover:opacity-60 transition-opacity duration-200 z-10"
              >
                <ChevronUp className="w-6 h-6 text-white" />
              </button>
            )}

            {index < videoData.length - 1 && (
              <button
                onClick={() => scrollToVideo(index + 1)}
                className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-20 hover:opacity-60 transition-opacity duration-200 z-10"
              >
                <ChevronDown className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Video Counter (Top Right) */}
      <div className="absolute top-12 right-4 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {currentVideoIndex + 1}/{videoData.length}
        </span>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Enhanced animations */
        @keyframes heartBeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        
        .animate-heartbeat {
          animation: heartBeat 1.5s ease-in-out infinite;
        }

        /* Touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95);
          }
        }

        /* Smooth transitions for all interactive elements */
        button, .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus states for accessibility */
        button:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}
