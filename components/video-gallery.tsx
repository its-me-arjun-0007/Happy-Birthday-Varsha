"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  SkipForward,
  Maximize,
  Minimize,
  Share2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blobAssets } from "@/lib/blob-assets"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

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
  fileSize?: number
  quality?: "low" | "medium" | "high"
  aspectRatio?: number
}

interface VideoState {
  // Loading states
  isLoading: boolean
  isLoaded: boolean
  hasError: boolean
  errorMessage: string
  retryCount: number
  loadProgress: number

  // Playback states
  isPlaying: boolean
  isPaused: boolean
  isBuffering: boolean
  currentTime: number
  duration: number
  bufferedRanges: TimeRanges | null

  // Audio/Video states
  volume: number
  isMuted: boolean
  playbackRate: number

  // UI states
  isFullscreen: boolean
  showControls: boolean
  isVisible: boolean

  // Network states
  networkSpeed: number
  bufferHealth: number
  canPlayThrough: boolean
}

interface NetworkInfo {
  isOnline: boolean
  effectiveType: string
  downlink: number
  rtt: number
}

// Enhanced video data with proper metadata
const videoData: Video[] = [
  {
    id: "1",
    title: "Vrshha's Special Moment",
    thumbnail: blobAssets.photos.photo1,
    videoUrl: blobAssets.videos.video1, // Use centralized asset management
    username: "varsha_official",
    avatar: blobAssets.photos.photo1,
    description: "A beautiful special moment captured perfectly! ✨ #memories",
    hashtags: ["#special", "#moment", "#beautiful", "#memories", "#vrshha"],
    likes: 1847,
    comments: 156,
    shares: 89,
    duration: 45,
    isVerified: true,
    quality: "high",
    aspectRatio: 9 / 16,
  },
  {
    id: "2",
    title: "Smiley Moments",
    thumbnail: blobAssets.photos.photo4,
    videoUrl: blobAssets.videos.video2, // Uses centralized asset management
    username: "varsha_official",
    avatar: blobAssets.photos.photo4,
    description: "Spreading smiles and joy everywhere! 😊✨ Life is beautiful when you smile",
    hashtags: ["#smile", "#joy", "#happiness", "#positivevibes", "#smiley"],
    likes: 3247,
    comments: 198,
    shares: 124,
    duration: 38,
    isVerified: true,
    quality: "high",
    aspectRatio: 9 / 16,
  },
  {
    id: "3",
    title: "Vrshha's Radiant Moments",
    thumbnail: blobAssets.photos.photo2,
    videoUrl: blobAssets.videos.video3, // Updated with new Vrshha video
    username: "varsha_official",
    avatar: blobAssets.photos.photo2,
    description:
      "Capturing the essence of pure radiance and beauty! ✨🌟 Every moment tells a story of grace and elegance",
    hashtags: ["#radiant", "#beauty", "#grace", "#elegant", "#vrshha", "#stunning"],
    likes: 4892,
    comments: 287,
    shares: 156,
    duration: 42,
    isVerified: true,
    quality: "high",
    aspectRatio: 9 / 16,
  },
  {
    id: "4",
    title: "Lively Moments",
    thumbnail: blobAssets.photos.photo5,
    videoUrl: blobAssets.videos.video4, // Now points to the new video
    username: "varsha_official",
    avatar: blobAssets.photos.photo5,
    description:
      "Capturing those spontaneous and lively moments! ✨ Life is full of beautiful surprises and joyful expressions 🌟",
    hashtags: ["#lively", "#spontaneous", "#joyful", "#beautiful", "#moments", "#expressions"],
    likes: 2156,
    comments: 178,
    shares: 95,
    duration: 35, // Estimated duration, will be updated when video loads
    isVerified: true,
    quality: "high",
    aspectRatio: 9 / 16,
  },
  {
    id: "5",
    title: "Smiley Moments Collection",
    thumbnail: blobAssets.photos.photo3,
    videoUrl: blobAssets.videos.video5, // Now points to the new smiley video
    username: "varsha_official",
    avatar: blobAssets.photos.photo3,
    description: "Beautiful smiley moments that brighten every day! 😊✨ Spreading joy and happiness wherever I go 🌟",
    hashtags: ["#smiley", "#happiness", "#joy", "#beautiful", "#moments", "#positivevibes"],
    likes: 4567,
    comments: 312,
    shares: 189,
    duration: 35, // Will be updated when video loads
    isVerified: true,
    quality: "high",
    aspectRatio: 9 / 16, // Updated for mobile-optimized aspect ratio
  },
  {
    id: "6",
    title: "Smiley September Moments",
    thumbnail: blobAssets.photos.photo6,
    videoUrl: blobAssets.videos.video6, // Now points to the new September 2024 smiley video
    username: "varsha_official",
    avatar: blobAssets.photos.photo6,
    description:
      "September smiles bringing warmth and joy! 😊✨ Every smile tells a beautiful story of happiness and positivity 🌟",
    hashtags: ["#september", "#smiley", "#joy", "#happiness", "#positivevibes", "#beautiful"],
    likes: 5234,
    comments: 445,
    shares: 234,
    duration: 38, // Will be updated when video loads
    isVerified: true,
    quality: "high",
    aspectRatio: 9 / 16,
  },
]

export default function VideoGallery() {
  // Core state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({})
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: true,
    effectiveType: "4g",
    downlink: 10,
    rtt: 100,
  })

  // UI state
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())
  const [globalShowControls, setGlobalShowControls] = useState(true)
  const [isFullscreenMode, setIsFullscreenMode] = useState(false)

  // Touch/gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const intersectionObserver = useRef<IntersectionObserver | null>(null)
  const controlsTimeout = useRef<NodeJS.Timeout>()
  const retryTimeouts = useRef<Record<string, NodeJS.Timeout>>({})
  const loadingTimeouts = useRef<Record<string, NodeJS.Timeout>>({})

  const { toast } = useToast()
  const currentVideo = videoData[currentVideoIndex]
  const currentVideoState = videoStates[currentVideo?.id] || {}

  // Initialize video states
  const initializeVideoStates = useCallback(() => {
    const initialStates: Record<string, VideoState> = {}

    videoData.forEach((video) => {
      initialStates[video.id] = {
        // Loading states
        isLoading: false,
        isLoaded: false,
        hasError: false,
        errorMessage: "",
        retryCount: 0,
        loadProgress: 0,

        // Playback states
        isPlaying: false,
        isPaused: true,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
        bufferedRanges: null,

        // Audio/Video states
        volume: 75,
        isMuted: true,
        playbackRate: 1,

        // UI states
        isFullscreen: false,
        showControls: true,
        isVisible: false,

        // Network states
        networkSpeed: 0,
        bufferHealth: 0,
        canPlayThrough: false,
      }
    })

    setVideoStates(initialStates)
  }, [])

  // Update video state helper
  const updateVideoState = useCallback((videoId: string, updates: Partial<VideoState>) => {
    setVideoStates((prev) => ({
      ...prev,
      [videoId]: { ...prev[videoId], ...updates },
    }))
  }, [])

  // Network monitoring
  const monitorNetwork = useCallback(() => {
    const updateNetworkInfo = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        setNetworkInfo({
          isOnline: navigator.onLine,
          effectiveType: connection.effectiveType || "4g",
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
        })
      } else {
        setNetworkInfo((prev) => ({ ...prev, isOnline: navigator.onLine }))
      }
    }

    const handleOnline = () => {
      updateNetworkInfo()
      toast({
        title: "Connection restored",
        description: "Videos will resume loading",
      })
    }

    const handleOffline = () => {
      updateNetworkInfo()
      toast({
        title: "Connection lost",
        description: "Videos paused until connection returns",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Monitor connection changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo)
    }

    updateNetworkInfo()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [toast])

  // Advanced video loading with optimization
  const loadVideo = useCallback(
    async (videoId: string, priority: "high" | "medium" | "low" = "medium") => {
      const video = videoData.find((v) => v.id === videoId)
      const videoElement = videoRefs.current[videoData.findIndex((v) => v.id === videoId)]

      if (!video || !videoElement || !networkInfo.isOnline) return

      // Clear any existing loading timeout
      if (loadingTimeouts.current[videoId]) {
        clearTimeout(loadingTimeouts.current[videoId])
      }

      updateVideoState(videoId, {
        isLoading: true,
        hasError: false,
        errorMessage: "",
        loadProgress: 0,
      })

      try {
        // Set video source and properties with audio enabled
        videoElement.src = video.videoUrl
        videoElement.preload = priority === "high" ? "auto" : "metadata"
        videoElement.playsInline = true
        videoElement.muted = false // CHANGED: Start with audio enabled
        videoElement.crossOrigin = "anonymous"
        videoElement.volume = 0.75 // Set default volume to 75%

        // Enhanced audio settings for better compatibility
        videoElement.setAttribute("webkit-playsinline", "true")
        videoElement.setAttribute("playsinline", "true")
        videoElement.setAttribute("controls", "false")

        // Audio context setup for better audio handling
        if (typeof window !== "undefined" && window.AudioContext) {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            if (audioContext.state === "suspended") {
              await audioContext.resume()
            }
          } catch (error) {
            console.log("Audio context setup failed:", error)
          }
        }

        // Optimize based on network conditions
        if (networkInfo.effectiveType === "slow-2g" || networkInfo.effectiveType === "2g") {
          videoElement.preload = "none"
        }

        // Start loading
        videoElement.load()

        // Set loading timeout based on network speed
        const timeoutDuration = networkInfo.effectiveType === "4g" ? 10000 : 20000
        loadingTimeouts.current[videoId] = setTimeout(() => {
          if (!videoStates[videoId]?.isLoaded) {
            updateVideoState(videoId, {
              isLoading: false,
              hasError: true,
              errorMessage: "Loading timeout - slow connection",
            })
          }
        }, timeoutDuration)
      } catch (error) {
        console.error(`Failed to load video ${videoId}:`, error)
        updateVideoState(videoId, {
          isLoading: false,
          hasError: true,
          errorMessage: "Failed to load video",
        })
      }
    },
    [networkInfo, videoStates, updateVideoState],
  )

  // Retry loading with exponential backoff
  const retryVideoLoad = useCallback(
    (videoId: string) => {
      const state = videoStates[videoId]
      if (!state || state.retryCount >= 3) {
        toast({
          title: "Video unavailable",
          description: "Maximum retry attempts reached",
          variant: "destructive",
        })
        return
      }

      // Clear existing retry timeout
      if (retryTimeouts.current[videoId]) {
        clearTimeout(retryTimeouts.current[videoId])
      }

      const retryDelay = Math.pow(2, state.retryCount) * 1000 // Exponential backoff

      updateVideoState(videoId, {
        retryCount: state.retryCount + 1,
      })

      retryTimeouts.current[videoId] = setTimeout(() => {
        loadVideo(videoId, "high")
        toast({
          title: "Retrying...",
          description: `Attempt ${state.retryCount + 1} of 3`,
        })
      }, retryDelay)
    },
    [videoStates, loadVideo, toast, updateVideoState],
  )

  // Scroll to video
  const scrollToVideo = useCallback(
    (index: number) => {
      if (index < 0 || index >= videoData.length) return

      setCurrentVideoIndex(index)

      const container = containerRef.current
      if (container) {
        const targetY = index * window.innerHeight
        container.scrollTo({
          top: targetY,
          behavior: "smooth",
        })
      }

      // Preload adjacent videos
      const adjacentIndices = [index - 1, index + 1].filter((i) => i >= 0 && i < videoData.length)
      adjacentIndices.forEach((i) => {
        const videoId = videoData[i].id
        const state = videoStates[videoId]
        if (!state?.isLoaded && !state?.isLoading) {
          loadVideo(videoId, "low")
        }
      })
    },
    [videoStates, loadVideo],
  )

  // Comprehensive video event handling
  const setupVideoEvents = useCallback(
    (videoElement: HTMLVideoElement, videoId: string) => {
      const video = videoData.find((v) => v.id === videoId)
      if (!video) return

      // Loading events
      const handleLoadStart = () => {
        updateVideoState(videoId, { isLoading: true, loadProgress: 0 })
      }

      const handleLoadedMetadata = () => {
        updateVideoState(videoId, {
          duration: videoElement.duration,
          loadProgress: 25,
        })
      }

      const handleLoadedData = () => {
        updateVideoState(videoId, { loadProgress: 50 })
      }

      const handleCanPlay = () => {
        updateVideoState(videoId, {
          isLoaded: true,
          isLoading: false,
          loadProgress: 75,
          canPlayThrough: false,
        })

        // Clear loading timeout
        if (loadingTimeouts.current[videoId]) {
          clearTimeout(loadingTimeouts.current[videoId])
        }
      }

      const handleCanPlayThrough = () => {
        updateVideoState(videoId, {
          loadProgress: 100,
          canPlayThrough: true,
        })
      }

      // Playback events
      const handlePlay = () => {
        updateVideoState(videoId, {
          isPlaying: true,
          isPaused: false,
          isBuffering: false,
        })
      }

      const handlePause = () => {
        updateVideoState(videoId, {
          isPlaying: false,
          isPaused: true,
        })
      }

      const handleWaiting = () => {
        updateVideoState(videoId, { isBuffering: true })
      }

      const handlePlaying = () => {
        updateVideoState(videoId, { isBuffering: false })
      }

      const handleTimeUpdate = () => {
        updateVideoState(videoId, { currentTime: videoElement.currentTime })
      }

      const handleDurationChange = () => {
        updateVideoState(videoId, { duration: videoElement.duration })
      }

      // Buffer monitoring
      const handleProgress = () => {
        if (videoElement.buffered.length > 0) {
          const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1)
          const bufferHealth = (bufferedEnd / videoElement.duration) * 100

          updateVideoState(videoId, {
            bufferedRanges: videoElement.buffered,
            bufferHealth: Math.min(100, bufferHealth),
          })
        }
      }

      // Error handling
      const handleError = () => {
        const error = videoElement.error
        let errorMessage = "Unknown error occurred"

        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Video loading was aborted"
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error occurred"
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Video decoding error"
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Video format not supported"
              break
          }
        }

        updateVideoState(videoId, {
          isLoading: false,
          hasError: true,
          errorMessage,
          isPlaying: false,
        })

        console.error(`Video error for ${videoId}:`, error)
      }

      const handleStalled = () => {
        updateVideoState(videoId, { isBuffering: true })
      }

      const handleSuspend = () => {
        updateVideoState(videoId, { isBuffering: false })
      }

      const handleEnded = () => {
        updateVideoState(videoId, {
          isPlaying: false,
          isPaused: true,
        })

        // Auto-advance to next video
        const currentIndex = videoData.findIndex((v) => v.id === videoId)
        if (currentIndex < videoData.length - 1) {
          setTimeout(() => scrollToVideo(currentIndex + 1), 500)
        }
      }

      // Add these audio-specific event handlers in the setupVideoEvents function
      const handleVolumeChange = () => {
        updateVideoState(videoId, {
          volume: Math.round(videoElement.volume * 100),
          isMuted: videoElement.muted,
        })
      }

      const handleAudioProcess = () => {
        // Ensure audio is properly synchronized
        if (
          videoElement.currentTime > 0 &&
          !videoElement.paused &&
          !videoElement.ended &&
          videoElement.readyState > 2
        ) {
          updateVideoState(videoId, { isBuffering: false })
        }
      }

      const handleRateChange = () => {
        updateVideoState(videoId, { playbackRate: videoElement.playbackRate })
      }

      // Add all event listeners
      const events = [
        ["loadstart", handleLoadStart],
        ["loadedmetadata", handleLoadedMetadata],
        ["loadeddata", handleLoadedData],
        ["canplay", handleCanPlay],
        ["canplaythrough", handleCanPlayThrough],
        ["play", handlePlay],
        ["pause", handlePause],
        ["waiting", handleWaiting],
        ["playing", handlePlaying],
        ["timeupdate", handleTimeUpdate],
        ["durationchange", handleDurationChange],
        ["progress", handleProgress],
        ["error", handleError],
        ["stalled", handleStalled],
        ["suspend", handleSuspend],
        ["ended", handleEnded],
        ["volumechange", handleVolumeChange], // Enhanced volume change handling
        ["ratechange", handleRateChange],
        ["audioprocess", handleAudioProcess], // Audio synchronization
      ] as const

      events.forEach(([event, handler]) => {
        videoElement.addEventListener(event, handler as EventListener)
      })

      return () => {
        events.forEach(([event, handler]) => {
          videoElement.removeEventListener(event, handler as EventListener)
        })
      }
    },
    [updateVideoState, scrollToVideo],
  )

  // Intersection Observer for lazy loading
  const setupIntersectionObserver = useCallback(() => {
    const options = {
      root: null,
      rootMargin: "50px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }

    intersectionObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement
        const videoId = videoElement.dataset.videoId
        if (!videoId) return

        const isVisible = entry.isIntersecting
        const visibilityRatio = entry.intersectionRatio

        updateVideoState(videoId, { isVisible })

        if (isVisible && visibilityRatio > 0.1) {
          // Start loading when video comes into view
          const state = videoStates[videoId]
          if (!state?.isLoaded && !state?.isLoading && !state?.hasError) {
            const priority = visibilityRatio > 0.5 ? "high" : "medium"
            loadVideo(videoId, priority)
          }

          // In the setupIntersectionObserver function, update the auto-play logic
          if (isVisible && visibilityRatio > 0.7 && videoId === currentVideo?.id) {
            const state = videoStates[videoId]
            if (state?.isLoaded && !state?.isPlaying && !state?.hasError) {
              // Try to play with audio first
              videoElement.muted = false
              videoElement.play().catch(async (error) => {
                console.log("Autoplay with audio blocked, trying muted:", error)
                // Fallback to muted autoplay
                videoElement.muted = true
                try {
                  await videoElement.play()
                  toast({
                    title: "🔇 Playing muted",
                    description: "Tap the volume button to enable sound",
                  })
                } catch (mutedError) {
                  console.error("All autoplay blocked:", mutedError)
                }
              })
            }
          }
        } else {
          // Pause non-current videos when out of view
          if (videoId !== currentVideo?.id && !videoElement.paused) {
            videoElement.pause()
          }
        }
      })
    }, options)

    // Observe all video elements
    videoRefs.current.forEach((video) => {
      if (video && intersectionObserver.current) {
        intersectionObserver.current.observe(video)
      }
    })
  }, [videoStates, currentVideo, loadVideo, updateVideoState, toast])

  // Playback controls
  const togglePlayPause = useCallback(async () => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement || !currentVideo) return

    const state = currentVideoState

    if (state.hasError) {
      retryVideoLoad(currentVideo.id)
      return
    }

    if (!state.isLoaded) {
      toast({
        title: "Video loading",
        description: "Please wait for the video to load",
      })
      return
    }

    try {
      if (state.isPlaying) {
        await videoElement.pause()
      } else {
        await videoElement.play()
      }
    } catch (error) {
      console.error("Playback error:", error)
      toast({
        title: "Playback error",
        description: "Unable to play video",
        variant: "destructive",
      })
    }
  }, [currentVideoIndex, currentVideo, currentVideoState, retryVideoLoad, toast])

  const toggleMute = useCallback(() => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement || !currentVideo) return

    const currentState = currentVideoState

    if (currentState.isMuted) {
      // Unmute: restore previous volume or set to 75% if no previous volume
      videoElement.muted = false
      const targetVolume = currentState.volume > 0 ? currentState.volume : 75
      videoElement.volume = targetVolume / 100

      toast({
        title: "🔊 Audio enabled",
        description: `Volume restored to ${targetVolume}%`,
      })
    } else {
      // Mute: save current volume and mute
      videoElement.muted = true

      toast({
        title: "🔇 Audio muted",
        description: "Click the volume button to unmute",
      })
    }
  }, [currentVideoIndex, currentVideo, currentVideoState, toast])

  const adjustVolume = useCallback(
    (newVolume: number) => {
      const videoElement = videoRefs.current[currentVideoIndex]
      if (!videoElement) return

      // Smooth volume transition
      const currentVolume = videoElement.volume * 100
      const volumeDiff = newVolume - currentVolume
      const steps = 10
      const stepSize = volumeDiff / steps

      let step = 0
      const volumeInterval = setInterval(() => {
        step++
        const intermediateVolume = currentVolume + stepSize * step
        videoElement.volume = Math.max(0, Math.min(1, intermediateVolume / 100))

        if (step >= steps) {
          clearInterval(volumeInterval)
          videoElement.volume = newVolume / 100
        }
      }, 20)

      // Auto-unmute if volume is increased from 0
      if (newVolume > 0 && videoElement.muted) {
        videoElement.muted = false
      }

      // Auto-mute if volume is set to 0
      if (newVolume === 0 && !videoElement.muted) {
        videoElement.muted = true
      }

      // Provide audio feedback
      if (newVolume === 0) {
        toast({
          title: "🔇 Muted",
          description: "Volume set to 0%",
        })
      } else if (newVolume === 100) {
        toast({
          title: "🔊 Max volume",
          description: "Volume set to 100%",
        })
      } else {
        toast({
          title: "🔊 Volume adjusted",
          description: `Volume set to ${newVolume}%`,
        })
      }
    },
    [currentVideoIndex, toast],
  )

  const seekTo = useCallback(
    (time: number) => {
      const videoElement = videoRefs.current[currentVideoIndex]
      if (!videoElement) return

      videoElement.currentTime = Math.max(0, Math.min(time, videoElement.duration))
    },
    [currentVideoIndex],
  )

  const adjustPlaybackRate = useCallback(
    (rate: number) => {
      const videoElement = videoRefs.current[currentVideoIndex]
      if (!videoElement) return

      videoElement.playbackRate = rate
      toast({
        title: "Playback speed",
        description: `${rate}x speed`,
      })
    },
    [currentVideoIndex, toast],
  )

  const toggleFullscreen = useCallback(async () => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement) return

    try {
      if (!document.fullscreenElement) {
        await videoElement.requestFullscreen()
        setIsFullscreenMode(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreenMode(false)
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
      toast({
        title: "Fullscreen error",
        description: "Unable to toggle fullscreen",
        variant: "destructive",
      })
    }
  }, [currentVideoIndex, toast])

  // Social interactions
  const toggleLike = useCallback((videoId: string) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }, [])

  const toggleSave = useCallback(
    (videoId: string) => {
      setSavedVideos((prev) => {
        const newSet = new Set(prev)
        const wasSaved = newSet.has(videoId)

        if (wasSaved) {
          newSet.delete(videoId)
        } else {
          newSet.add(videoId)
        }

        toast({
          title: wasSaved ? "Removed from saved" : "Saved!",
          description: wasSaved ? "Video removed from collection" : "Video saved to collection",
        })

        return newSet
      })
    },
    [toast],
  )

  const handleShare = useCallback(
    async (video: Video) => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${video.username}'s video`,
            text: video.description,
            url: window.location.href,
          })
        } catch (error) {
          // User cancelled
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
            title: "Share failed",
            description: "Unable to share video",
            variant: "destructive",
          })
        }
      }
    },
    [toast],
  )

  // Touch/gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || !isDragging) return

      const touch = e.touches[0]
      const deltaY = touchStart.y - touch.clientY
      const deltaX = touchStart.x - touch.clientX

      // Prevent horizontal scrolling for vertical swipes
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        e.preventDefault()
      }
    },
    [touchStart, isDragging],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || !isDragging) return

      const touch = e.changedTouches[0]
      const deltaY = touchStart.y - touch.clientY
      const deltaX = touchStart.x - touch.clientX

      // Only handle vertical swipes
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentVideoIndex < videoData.length - 1) {
          // Swipe up - next video
          scrollToVideo(currentVideoIndex + 1)
        } else if (deltaY < 0 && currentVideoIndex > 0) {
          // Swipe down - previous video
          scrollToVideo(currentVideoIndex - 1)
        }
      }

      setTouchStart(null)
      setIsDragging(false)
    },
    [touchStart, isDragging, currentVideoIndex, scrollToVideo],
  )

  // Controls auto-hide
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }

    setGlobalShowControls(true)

    controlsTimeout.current = setTimeout(() => {
      setGlobalShowControls(false)
    }, 3000)
  }, [])

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentVideo) return

      switch (e.key) {
        case " ":
        case "k":
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
        case "ArrowLeft":
          e.preventDefault()
          seekTo(currentVideoState.currentTime - 10)
          break
        case "ArrowRight":
          e.preventDefault()
          seekTo(currentVideoState.currentTime + 10)
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "l":
          e.preventDefault()
          toggleLike(currentVideo.id)
          break
        case "s":
          e.preventDefault()
          toggleSave(currentVideo.id)
          break
        case "1":
          e.preventDefault()
          adjustPlaybackRate(0.5)
          break
        case "2":
          e.preventDefault()
          adjustPlaybackRate(1)
          break
        case "3":
          e.preventDefault()
          adjustPlaybackRate(1.5)
          break
        case "4":
          e.preventDefault()
          adjustPlaybackRate(2)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    currentVideo,
    currentVideoIndex,
    currentVideoState,
    togglePlayPause,
    scrollToVideo,
    seekTo,
    toggleMute,
    toggleFullscreen,
    toggleLike,
    toggleSave,
    adjustPlaybackRate,
  ])

  // Utility functions
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  const formatCount = useCallback((count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }, [])

  // Initialize everything
  useEffect(() => {
    initializeVideoStates()
    const cleanupNetwork = monitorNetwork()

    return cleanupNetwork
  }, [initializeVideoStates, monitorNetwork])

  // Setup video events and intersection observer
  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Setup video events
    videoRefs.current.forEach((videoElement, index) => {
      if (videoElement) {
        const videoId = videoData[index].id
        videoElement.dataset.videoId = videoId

        const cleanup = setupVideoEvents(videoElement, videoId)
        if (cleanup) cleanups.push(cleanup)
      }
    })

    // Setup intersection observer
    setupIntersectionObserver()

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect()
      }
    }
  }, [setupVideoEvents, setupIntersectionObserver])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
      Object.values(retryTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
      Object.values(loadingTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  /* ---------- audio / video sync monitor ---------- */
  useEffect(() => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement) return

    const checkSync = () => {
      // simple heuristic – mark buffering if A/V drift grows
      const drift = Math.abs(
        videoElement.currentTime - (videoElement.audioTracks?.[0]?.enabled ? videoElement.currentTime : 0),
      )
      if (drift > 0.3) {
        updateVideoState(videoData[currentVideoIndex].id, { isBuffering: true })
      }
    }

    const interval = setInterval(checkSync, 1000)
    return () => clearInterval(interval)
  }, [currentVideoIndex, updateVideoState])

  // Memoized components for performance
  const LoadingIndicator = useMemo(
    () =>
      ({ videoId, state }: { videoId: string; state: VideoState }) => (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
          <div className="relative mb-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            {state.loadProgress > 0 && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${state.loadProgress}%` }}
                />
              </div>
            )}
          </div>
          <div className="text-center text-white">
            <p className="text-lg font-medium mb-1">Loading video...</p>
            {state.loadProgress > 0 && (
              <p className="text-sm text-white/70">{Math.round(state.loadProgress)}% loaded</p>
            )}
            {state.networkSpeed > 0 && <p className="text-xs text-white/50">{Math.round(state.networkSpeed)} KB/s</p>}
          </div>
        </div>
      ),
    [],
  )

  const ErrorIndicator = useMemo(
    () =>
      ({ videoId, state }: { videoId: string; state: VideoState }) => (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
          <div className="text-center max-w-sm px-4">
            {!networkInfo.isOnline ? (
              <WifiOff className="w-16 h-16 text-white mb-4 mx-auto" />
            ) : (
              <AlertTriangle className="w-16 h-16 text-white mb-4 mx-auto" />
            )}
            <h3 className="text-white text-xl font-semibold mb-2">
              {!networkInfo.isOnline ? "No Connection" : "Video Error"}
            </h3>
            <p className="text-white/80 text-sm mb-4">{state.errorMessage || "Unable to load video"}</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => retryVideoLoad(videoId)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                disabled={state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {state.retryCount >= 3 ? "Max retries reached" : `Retry (${state.retryCount}/3)`}
              </Button>
              {currentVideoIndex < videoData.length - 1 && (
                <Button
                  onClick={() => scrollToVideo(currentVideoIndex + 1)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip to next
                </Button>
              )}
            </div>
          </div>
        </div>
      ),
    [networkInfo.isOnline, retryVideoLoad, currentVideoIndex, scrollToVideo],
  )

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Network Status */}
      {!networkInfo.isOnline && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">No internet connection</span>
        </div>
      )}

      {/* Network Quality Indicator */}
      {networkInfo.isOnline && (
        <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-2">
          <Wifi className="w-3 h-3" />
          <span className="text-xs capitalize">{networkInfo.effectiveType}</span>
        </div>
      )}

      {/* Video Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videoData.map((video, index) => {
          const state = videoStates[video.id] || {}
          const isCurrentVideo = index === currentVideoIndex

          return (
            <div
              key={video.id}
              className="relative w-full h-screen snap-start flex items-center justify-center bg-black"
            >
              {/* Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el
                }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  state.isLoaded ? "opacity-100" : "opacity-0"
                }`}
                poster={video.thumbnail}
                muted={state.isMuted !== false}
                playsInline
                preload="none"
                crossOrigin="anonymous"
                loop
                data-video-id={video.id}
                style={{
                  aspectRatio: video.aspectRatio || 16 / 9,
                }}
              />

              {/* Loading State */}
              {state.isLoading && <LoadingIndicator videoId={video.id} state={state} />}

              {/* Buffering State */}
              {state.isBuffering && !state.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <span className="text-white text-sm">Buffering...</span>
                  {state.bufferHealth > 0 && (
                    <div className="mt-2 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/60 transition-all duration-300"
                        style={{ width: `${state.bufferHealth}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error State */}
              {state.hasError && <ErrorIndicator videoId={video.id} state={state} />}

              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center" onClick={togglePlayPause}>
                {!state.isPlaying &&
                  isCurrentVideo &&
                  !state.isLoading &&
                  !state.isBuffering &&
                  !state.hasError &&
                  state.isLoaded && (
                    <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all duration-200 hover:scale-110">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                  )}
              </div>

              {/* Progress Bar */}
              {isCurrentVideo && state.duration > 0 && (
                <div className="absolute top-2 left-4 right-4 z-30">
                  <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                    {/* Playback progress */}
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{
                        width: `${(state.currentTime / state.duration) * 100}%`,
                      }}
                    />
                    {/* Buffer progress */}
                    <div
                      className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-300"
                      style={{ width: `${state.bufferHealth}%` }}
                    />
                  </div>
                </div>
              )}

              {/* User Info & Description */}
              <div
                className={`absolute bottom-0 left-0 right-20 z-20 p-4 transition-all duration-300 ${
                  globalShowControls || !state.isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="space-y-3">
                  {/* User Info */}
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
                    {state.isLoaded && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          <span className="text-xs capitalize">{video.quality}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Playback Controls */}
                  {isCurrentVideo && state.duration > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-white/70 text-xs font-mono">
                          {formatTime(state.currentTime)} / {formatTime(state.duration)}
                        </span>

                        {/* Seek Bar */}
                        <div className="w-32 sm:w-48">
                          <Slider
                            value={[state.currentTime]}
                            onValueChange={(value) => seekTo(value[0])}
                            max={state.duration || 100}
                            step={0.1}
                            className="cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Playback Speed Controls */}
                      <div className="flex items-center space-x-1">
                        {[0.5, 1, 1.5, 2].map((rate) => (
                          <Button
                            key={rate}
                            variant="ghost"
                            size="sm"
                            onClick={() => adjustPlaybackRate(rate)}
                            className={`text-xs h-6 px-2 ${
                              state.playbackRate === rate ? "bg-white/20 text-white" : "text-white/70"
                            }`}
                          >
                            {rate}x
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Right Side) */}
              <div
                className={`absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-6 transition-all duration-300 ${
                  globalShowControls || !state.isPlaying ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                }`}
              >
                {/* Like Button */}
                <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center space-y-1 group">
                  <Heart
                    className={`w-7 h-7 transition-all duration-200 ${
                      likedVideos.has(video.id)
                        ? "text-red-500 fill-red-500 scale-110"
                        : "text-white group-hover:scale-110"
                    }`}
                  />
                  <span className="text-white text-xs font-medium">
                    {formatCount((video.likes || 0) + (likedVideos.has(video.id) ? 1 : 0))}
                  </span>
                </button>

                {/* Comment Button */}
                <button className="flex flex-col items-center space-y-1 group">
                  <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-white text-xs font-medium">{formatCount(video.comments || 0)}</span>
                </button>

                {/* Share Button */}
                <button onClick={() => handleShare(video)} className="flex flex-col items-center space-y-1 group">
                  <Share2 className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
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

              {/* Enhanced Volume & Controls */}
              <div
                className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${
                  globalShowControls || !state.isPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  {/* Volume Slider with Audio Visualization */}
                  {isCurrentVideo && <div></div>}

                  {/* Control Buttons */}
                  <div className="flex flex-col items-center space-y-2">
                    {/* Enhanced Mute Button with Audio Status */}
                    <button
                      onClick={toggleMute}
                      className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all duration-200 ${
                        state.isMuted ? "bg-red-500/80 hover:bg-red-600/80" : "bg-green-500/80 hover:bg-green-600/80"
                      }`}
                    >
                      {state.isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>

                    {/* Audio Quality Indicator */}
                    {!state.isMuted && state.isPlaying && (
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white text-xs">HD Audio</span>
                      </div>
                    )}

                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all duration-200"
                    >
                      {isFullscreenMode ? (
                        <Minimize className="w-5 h-5 text-white" />
                      ) : (
                        <Maximize className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Scroll Indicators */}
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

              {/* Quality Indicator */}
              {state.isLoaded && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      state.bufferHealth > 80
                        ? "bg-green-500"
                        : state.bufferHealth > 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <span className="text-white text-xs capitalize">{video.quality}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Video Counter */}
      <div className="absolute top-12 right-4 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {currentVideoIndex + 1}/{videoData.length}
        </span>
      </div>

      {/* Loading Summary */}
      {Object.values(videoStates).some((state) => state.isLoading) && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span className="text-white text-sm">
              Loading {Object.values(videoStates).filter((state) => state.isLoading).length} videos...
            </span>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Smooth transitions */
        * {
          transition-property: opacity, transform, background-color, border-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        /* Enhanced focus states */
        button:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }

        /* Touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95);
          }
        }

        /* Video optimizations */
        video {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Fullscreen optimizations */
        .video-container:fullscreen {
          display: flex;
          align-items: center;
          justify-content: center;
          background: black;
        }

        .video-container:fullscreen video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  )
}
