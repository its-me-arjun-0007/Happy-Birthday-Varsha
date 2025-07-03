"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
  RefreshCw,
  Share2,
  WifiOff,
  CheckCircle,
  XCircle,
  Info,
  Settings,
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

interface VideoState {
  isLoading: boolean
  isLoaded: boolean
  hasError: boolean
  errorMessage: string
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  canPlay: boolean
  retryCount: number
  readyState: number
  networkState: number
  buffered: number
  urlTested: boolean
  urlAccessible: boolean
}

interface VideoDebugInfo {
  videoId: string
  url: string
  element: HTMLVideoElement | null
  state: VideoState
  lastError: string | null
  loadAttempts: number
  playAttempts: number
}

// Video data with proper URL validation
const videoData: Video[] = [
  {
    id: "1",
    title: "Vrshha's Special Moment",
    thumbnail: blobAssets.photos.photo1,
    videoUrl: blobAssets.videos.video1,
    username: "varsha_official",
    avatar: blobAssets.photos.photo1,
    description: "A beautiful special moment captured perfectly! ✨ #memories",
    hashtags: ["#special", "#moment", "#beautiful", "#memories", "#vrshha"],
    likes: 1847,
    comments: 156,
    shares: 89,
    duration: 45,
    isVerified: true,
  },
  {
    id: "2",
    title: "Smiley Moments",
    thumbnail: blobAssets.photos.photo4,
    videoUrl: blobAssets.videos.video2,
    username: "varsha_official",
    avatar: blobAssets.photos.photo4,
    description: "Spreading smiles and joy everywhere! 😊✨ Life is beautiful when you smile",
    hashtags: ["#smile", "#joy", "#happiness", "#positivevibes", "#smiley"],
    likes: 3247,
    comments: 198,
    shares: 124,
    duration: 38,
    isVerified: true,
  },
  {
    id: "3",
    title: "Vrshha's Radiant Moments",
    thumbnail: blobAssets.photos.photo2,
    videoUrl: blobAssets.videos.video3,
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
  },
  {
    id: "4",
    title: "Lively Moments",
    thumbnail: blobAssets.photos.photo5,
    videoUrl: blobAssets.videos.video4,
    username: "varsha_official",
    avatar: blobAssets.photos.photo5,
    description:
      "Capturing those spontaneous and lively moments! ✨ Life is full of beautiful surprises and joyful expressions 🌟",
    hashtags: ["#lively", "#spontaneous", "#joyful", "#beautiful", "#moments", "#expressions"],
    likes: 2156,
    comments: 178,
    shares: 95,
    duration: 35,
    isVerified: true,
  },
  {
    id: "5",
    title: "Smiley Moments Collection",
    thumbnail: blobAssets.photos.photo3,
    videoUrl: blobAssets.videos.video5,
    username: "varsha_official",
    avatar: blobAssets.photos.photo3,
    description: "Beautiful smiley moments that brighten every day! 😊✨ Spreading joy and happiness wherever I go 🌟",
    hashtags: ["#smiley", "#happiness", "#joy", "#beautiful", "#moments", "#positivevibes"],
    likes: 4567,
    comments: 312,
    shares: 189,
    duration: 35,
    isVerified: true,
  },
  {
    id: "6",
    title: "Smiley September Moments",
    thumbnail: blobAssets.photos.photo6,
    videoUrl: blobAssets.videos.video6,
    username: "varsha_official",
    avatar: blobAssets.photos.photo6,
    description:
      "September smiles bringing warmth and joy! 😊✨ Every smile tells a beautiful story of happiness and positivity 🌟",
    hashtags: ["#september", "#smiley", "#joy", "#happiness", "#positivevibes", "#beautiful"],
    likes: 5234,
    comments: 445,
    shares: 234,
    duration: 38,
    isVerified: true,
  },
]

export default function VideoGallery() {
  // Core state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({})
  const [debugInfo, setDebugInfo] = useState<VideoDebugInfo[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // UI state
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())
  const [showControls, setShowControls] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const intersectionObserver = useRef<IntersectionObserver | null>(null)
  const controlsTimeout = useRef<NodeJS.Timeout>()
  const loadAttempts = useRef<Record<string, number>>({})
  const playAttempts = useRef<Record<string, number>>({})

  const { toast } = useToast()
  const currentVideo = videoData[currentVideoIndex]
  const currentVideoState = videoStates[currentVideo?.id] || {}

  // Initialize video states with comprehensive tracking
  const initializeVideoStates = useCallback(() => {
    const initialStates: Record<string, VideoState> = {}
    const initialDebugInfo: VideoDebugInfo[] = []

    videoData.forEach((video, index) => {
      initialStates[video.id] = {
        isLoading: false,
        isLoaded: false,
        hasError: false,
        errorMessage: "",
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 75,
        isMuted: true,
        canPlay: false,
        retryCount: 0,
        readyState: 0,
        networkState: 0,
        buffered: 0,
        urlTested: false,
        urlAccessible: false,
      }

      initialDebugInfo.push({
        videoId: video.id,
        url: video.videoUrl,
        element: null,
        state: initialStates[video.id],
        lastError: null,
        loadAttempts: 0,
        playAttempts: 0,
      })

      // Initialize attempt counters
      loadAttempts.current[video.id] = 0
      playAttempts.current[video.id] = 0
    })

    setVideoStates(initialStates)
    setDebugInfo(initialDebugInfo)
  }, [])

  // Update video state with debug tracking
  const updateVideoState = useCallback((videoId: string, updates: Partial<VideoState>) => {
    setVideoStates((prev) => {
      const newState = { ...prev[videoId], ...updates }

      // Update debug info
      setDebugInfo((prevDebug) =>
        prevDebug.map((info) => (info.videoId === videoId ? { ...info, state: newState } : info)),
      )

      return {
        ...prev,
        [videoId]: newState,
      }
    })
  }, [])

  // Test video URL accessibility
  const testVideoUrl = useCallback(
    async (videoId: string, url: string): Promise<boolean> => {
      try {
        console.log(`🔍 Testing video URL for ${videoId}:`, url)

        const response = await fetch(url, {
          method: "HEAD",
          mode: "cors",
          cache: "no-cache",
        })

        const accessible = response.ok
        console.log(`✅ URL test for ${videoId}:`, accessible ? "ACCESSIBLE" : "NOT ACCESSIBLE", response.status)

        updateVideoState(videoId, {
          urlTested: true,
          urlAccessible: accessible,
        })

        if (!accessible) {
          updateVideoState(videoId, {
            hasError: true,
            errorMessage: `Video URL not accessible (${response.status})`,
          })
        }

        return accessible
      } catch (error) {
        console.error(`❌ URL test failed for ${videoId}:`, error)
        updateVideoState(videoId, {
          urlTested: true,
          urlAccessible: false,
          hasError: true,
          errorMessage: `URL test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
        return false
      }
    },
    [updateVideoState],
  )

  // Enhanced video loading with comprehensive error handling
  const loadVideo = useCallback(
    async (videoId: string, videoElement: HTMLVideoElement, force = false) => {
      const video = videoData.find((v) => v.id === videoId)
      if (!video || !videoElement) {
        console.error(`❌ Load video failed: video or element not found for ${videoId}`)
        return false
      }

      const currentAttempts = loadAttempts.current[videoId] || 0
      if (currentAttempts >= 3 && !force) {
        console.log(`⏭️ Skipping load for ${videoId}: max attempts reached`)
        return false
      }

      loadAttempts.current[videoId] = currentAttempts + 1
      console.log(`🎬 Loading video ${videoId} (attempt ${loadAttempts.current[videoId]}):`, video.videoUrl)

      updateVideoState(videoId, {
        isLoading: true,
        hasError: false,
        errorMessage: "",
      })

      try {
        // Test URL accessibility first
        const urlAccessible = await testVideoUrl(videoId, video.videoUrl)
        if (!urlAccessible) {
          throw new Error("Video URL is not accessible")
        }

        // Configure video element with optimal settings
        videoElement.preload = "auto"
        videoElement.playsInline = true
        videoElement.muted = true
        videoElement.crossOrigin = "anonymous"
        videoElement.volume = 0.75
        videoElement.loop = true

        // Add additional attributes for better compatibility
        videoElement.setAttribute("webkit-playsinline", "true")
        videoElement.setAttribute("playsinline", "true")
        videoElement.setAttribute("controls", "false")

        // Set source if different
        if (videoElement.src !== video.videoUrl) {
          console.log(`📝 Setting video source for ${videoId}`)
          videoElement.src = video.videoUrl
        }

        // Wait for video to be ready with timeout
        const loadPromise = new Promise<void>((resolve, reject) => {
          let resolved = false

          const handleCanPlay = () => {
            if (resolved) return
            resolved = true
            console.log(`✅ Video ${videoId} can play - readyState: ${videoElement.readyState}`)
            cleanup()
            resolve()
          }

          const handleLoadedData = () => {
            if (resolved) return
            console.log(`📊 Video ${videoId} loaded data - readyState: ${videoElement.readyState}`)
            if (videoElement.readyState >= 2) {
              handleCanPlay()
            }
          }

          const handleError = (e: Event) => {
            if (resolved) return
            resolved = true
            const error = videoElement.error
            console.error(`❌ Video ${videoId} load error:`, error, e)
            cleanup()
            reject(new Error(error ? `Media error ${error.code}: ${error.message}` : "Unknown video error"))
          }

          const cleanup = () => {
            videoElement.removeEventListener("canplay", handleCanPlay)
            videoElement.removeEventListener("loadeddata", handleLoadedData)
            videoElement.removeEventListener("error", handleError)
          }

          videoElement.addEventListener("canplay", handleCanPlay)
          videoElement.addEventListener("loadeddata", handleLoadedData)
          videoElement.addEventListener("error", handleError)

          // Force load if not already loading
          if (videoElement.readyState < 2) {
            console.log(`🔄 Triggering load for ${videoId}`)
            videoElement.load()
          } else {
            console.log(`⚡ Video ${videoId} already loaded`)
            handleCanPlay()
          }

          // Timeout after 15 seconds
          setTimeout(() => {
            if (!resolved) {
              resolved = true
              console.warn(`⏰ Video ${videoId} load timeout`)
              cleanup()
              reject(new Error("Video load timeout"))
            }
          }, 15000)
        })

        await loadPromise

        updateVideoState(videoId, {
          isLoaded: true,
          isLoading: false,
          canPlay: true,
          duration: videoElement.duration || video.duration,
          readyState: videoElement.readyState,
          networkState: videoElement.networkState,
        })

        console.log(`🎉 Video ${videoId} loaded successfully`)
        return true
      } catch (error) {
        console.error(`💥 Failed to load video ${videoId}:`, error)
        updateVideoState(videoId, {
          isLoading: false,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : "Failed to load video",
          retryCount: (videoStates[videoId]?.retryCount || 0) + 1,
        })

        // Update debug info
        setDebugInfo((prev) =>
          prev.map((info) =>
            info.videoId === videoId
              ? {
                  ...info,
                  lastError: error instanceof Error ? error.message : "Unknown error",
                  loadAttempts: loadAttempts.current[videoId] || 0,
                }
              : info,
          ),
        )

        return false
      }
    },
    [updateVideoState, videoStates, testVideoUrl],
  )

  // Enhanced play/pause with detailed logging
  const togglePlayPause = useCallback(async () => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement || !currentVideo) {
      console.error("❌ No video element or current video")
      return
    }

    setHasUserInteracted(true)
    const state = currentVideoState

    const currentPlayAttempts = playAttempts.current[currentVideo.id] || 0
    playAttempts.current[currentVideo.id] = currentPlayAttempts + 1

    console.log(
      `🎮 Toggle play/pause for video ${currentVideo.id} (attempt ${playAttempts.current[currentVideo.id]})`,
      {
        isLoaded: state.isLoaded,
        isPlaying: state.isPlaying,
        hasError: state.hasError,
        canPlay: state.canPlay,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState,
        src: videoElement.src,
      },
    )

    if (state.hasError) {
      console.log(`🔄 Retrying failed video ${currentVideo.id}`)
      const success = await loadVideo(currentVideo.id, videoElement, true)
      if (!success) return
    }

    if (!state.isLoaded || !state.canPlay) {
      if (!state.isLoading) {
        console.log(`📥 Loading video ${currentVideo.id} before play`)
        const success = await loadVideo(currentVideo.id, videoElement)
        if (!success) {
          toast({
            title: "Video Load Failed",
            description: "Unable to load video. Please try again.",
            variant: "destructive",
          })
          return
        }
      } else {
        toast({
          title: "Loading video...",
          description: "Please wait while the video loads",
        })
        return
      }
    }

    try {
      if (state.isPlaying) {
        console.log(`⏸️ Pausing video ${currentVideo.id}`)
        await videoElement.pause()
      } else {
        console.log(`▶️ Playing video ${currentVideo.id}`)

        // Try to play with audio first
        videoElement.muted = false
        try {
          await videoElement.play()
          console.log(`🔊 Video ${currentVideo.id} playing with audio`)
          toast({
            title: "🎵 Playing with sound!",
            description: "Enjoy the video with audio",
          })
        } catch (audioError) {
          console.log(`🔇 Audio blocked, trying muted for ${currentVideo.id}:`, audioError)
          videoElement.muted = true
          await videoElement.play()
          console.log(`🔇 Video ${currentVideo.id} playing muted`)
          toast({
            title: "Playing (muted)",
            description: "Click volume button to enable sound",
          })
        }
      }
    } catch (error) {
      console.error(`💥 Playback error for video ${currentVideo.id}:`, error)

      // Update debug info
      setDebugInfo((prev) =>
        prev.map((info) =>
          info.videoId === currentVideo.id
            ? {
                ...info,
                lastError: error instanceof Error ? error.message : "Playback error",
                playAttempts: playAttempts.current[currentVideo.id] || 0,
              }
            : info,
        ),
      )

      toast({
        title: "Playback Error",
        description: "Unable to play video. Trying to reload...",
        variant: "destructive",
      })

      // Try to reload the video
      await loadVideo(currentVideo.id, videoElement, true)
    }
  }, [currentVideoIndex, currentVideo, currentVideoState, loadVideo, toast])

  // Setup comprehensive video events
  const setupVideoEvents = useCallback(
    (videoElement: HTMLVideoElement, videoId: string) => {
      console.log(`🔧 Setting up events for video ${videoId}`)

      const updateDebugElement = () => {
        setDebugInfo((prev) =>
          prev.map((info) => (info.videoId === videoId ? { ...info, element: videoElement } : info)),
        )
      }

      const handleLoadStart = () => {
        console.log(`📡 Video ${videoId} load start`)
        updateVideoState(videoId, { isLoading: true })
      }

      const handleLoadedMetadata = () => {
        console.log(`📊 Video ${videoId} metadata loaded - duration: ${videoElement.duration}`)
        updateVideoState(videoId, {
          duration: videoElement.duration,
          readyState: videoElement.readyState,
          networkState: videoElement.networkState,
        })
      }

      const handleLoadedData = () => {
        console.log(`📦 Video ${videoId} data loaded - readyState: ${videoElement.readyState}`)
        updateVideoState(videoId, {
          readyState: videoElement.readyState,
          networkState: videoElement.networkState,
        })
      }

      const handleCanPlay = () => {
        console.log(`✅ Video ${videoId} can play - readyState: ${videoElement.readyState}`)
        updateVideoState(videoId, {
          canPlay: true,
          isLoaded: true,
          isLoading: false,
          readyState: videoElement.readyState,
          networkState: videoElement.networkState,
        })
      }

      const handleCanPlayThrough = () => {
        console.log(`🚀 Video ${videoId} can play through`)
        updateVideoState(videoId, {
          readyState: videoElement.readyState,
          networkState: videoElement.networkState,
        })
      }

      const handlePlay = () => {
        console.log(`▶️ Video ${videoId} started playing`)
        updateVideoState(videoId, { isPlaying: true })
      }

      const handlePause = () => {
        console.log(`⏸️ Video ${videoId} paused`)
        updateVideoState(videoId, { isPlaying: false })
      }

      const handleTimeUpdate = () => {
        updateVideoState(videoId, {
          currentTime: videoElement.currentTime,
          buffered: videoElement.buffered.length > 0 ? videoElement.buffered.end(0) : 0,
        })
      }

      const handleProgress = () => {
        const buffered = videoElement.buffered.length > 0 ? videoElement.buffered.end(0) : 0
        updateVideoState(videoId, { buffered })
      }

      const handleError = (e: Event) => {
        const error = videoElement.error
        console.error(`❌ Video ${videoId} error:`, error, e)

        let errorMessage = "Unknown error"
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = `Network error (${error.code}): ${error.message}`
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = `Decode error (${error.code}): ${error.message}`
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = `Source not supported (${error.code}): ${error.message}`
              break
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = `Playback aborted (${error.code}): ${error.message}`
              break
            default:
              errorMessage = `Media error (${error.code}): ${error.message}`
          }
        }

        updateVideoState(videoId, {
          isLoading: false,
          hasError: true,
          errorMessage,
          isPlaying: false,
          readyState: videoElement.readyState,
          networkState: videoElement.networkState,
        })

        // Update debug info
        setDebugInfo((prev) =>
          prev.map((info) => (info.videoId === videoId ? { ...info, lastError: errorMessage } : info)),
        )
      }

      const handleVolumeChange = () => {
        updateVideoState(videoId, {
          volume: Math.round(videoElement.volume * 100),
          isMuted: videoElement.muted,
        })
      }

      const handleEnded = () => {
        console.log(`🏁 Video ${videoId} ended`)
        updateVideoState(videoId, { isPlaying: false })

        // Auto-advance to next video
        const currentIndex = videoData.findIndex((v) => v.id === videoId)
        if (currentIndex < videoData.length - 1) {
          setTimeout(() => scrollToVideo(currentIndex + 1), 500)
        }
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
        ["timeupdate", handleTimeUpdate],
        ["progress", handleProgress],
        ["error", handleError],
        ["volumechange", handleVolumeChange],
        ["ended", handleEnded],
      ] as const

      events.forEach(([event, handler]) => {
        videoElement.addEventListener(event, handler as EventListener)
      })

      updateDebugElement()

      return () => {
        console.log(`🧹 Cleaning up events for video ${videoId}`)
        events.forEach(([event, handler]) => {
          videoElement.removeEventListener(event, handler as EventListener)
        })
      }
    },
    [updateVideoState],
  )

  // Test all video URLs on component mount
  const testAllVideoUrls = useCallback(async () => {
    console.log("🔍 Testing all video URLs...")
    const results = await Promise.allSettled(videoData.map((video) => testVideoUrl(video.id, video.videoUrl)))

    const accessibleCount = results.filter((result) => result.status === "fulfilled" && result.value).length

    console.log(`📊 URL Test Results: ${accessibleCount}/${videoData.length} videos accessible`)

    if (accessibleCount === 0) {
      toast({
        title: "⚠️ Video Access Issue",
        description: "No video URLs are accessible. Check network connection.",
        variant: "destructive",
      })
    } else if (accessibleCount < videoData.length) {
      toast({
        title: "⚠️ Some Videos Unavailable",
        description: `${videoData.length - accessibleCount} videos may not play correctly.`,
      })
    } else {
      toast({
        title: "✅ All Videos Ready",
        description: "All video URLs are accessible and ready to play.",
      })
    }
  }, [testVideoUrl, toast])

  // Other methods remain the same...
  const toggleMute = useCallback(() => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement || !currentVideo) return

    setHasUserInteracted(true)
    const currentState = currentVideoState

    if (currentState.isMuted) {
      videoElement.muted = false
      const targetVolume = currentState.volume > 0 ? currentState.volume : 75
      videoElement.volume = targetVolume / 100

      toast({
        title: "🔊 Audio enabled",
        description: `Volume set to ${targetVolume}%`,
      })
    } else {
      videoElement.muted = true
      toast({
        title: "🔇 Audio muted",
        description: "Click volume to unmute",
      })
    }
  }, [currentVideoIndex, currentVideo, currentVideoState, toast])

  const scrollToVideo = useCallback((index: number) => {
    if (index < 0 || index >= videoData.length) return

    console.log(`📜 Scrolling to video ${index + 1}`)
    setCurrentVideoIndex(index)

    const container = containerRef.current
    if (container) {
      const targetY = index * window.innerHeight
      container.scrollTo({
        top: targetY,
        behavior: "smooth",
      })
    }
  }, [])

  const setupIntersectionObserver = useCallback(() => {
    const options = {
      root: null,
      rootMargin: "50px",
      threshold: [0.1, 0.5, 0.9],
    }

    intersectionObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement
        const videoId = videoElement.dataset.videoId
        if (!videoId) return

        const isVisible = entry.isIntersecting
        const visibilityRatio = entry.intersectionRatio

        console.log(`👁️ Video ${videoId} visibility: ${isVisible} (${Math.round(visibilityRatio * 100)}%)`)

        if (isVisible && visibilityRatio > 0.5) {
          const state = videoStates[videoId]

          // Load video if not loaded
          if (!state?.isLoaded && !state?.isLoading && !state?.hasError) {
            console.log(`📥 Auto-loading video ${videoId} due to visibility`)
            loadVideo(videoId, videoElement)
          }

          // Update current video index
          const videoIndex = videoData.findIndex((v) => v.id === videoId)
          if (videoIndex !== -1 && videoIndex !== currentVideoIndex) {
            setCurrentVideoIndex(videoIndex)
          }
        }
      })
    }, options)

    videoRefs.current.forEach((video) => {
      if (video && intersectionObserver.current) {
        intersectionObserver.current.observe(video)
      }
    })
  }, [videoStates, loadVideo, currentVideoIndex])

  // Social interactions (same as before)
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

  const retryVideo = useCallback(
    async (videoId: string) => {
      const videoElement = videoRefs.current[videoData.findIndex((v) => v.id === videoId)]
      if (!videoElement) return

      console.log(`🔄 Manual retry for video ${videoId}`)
      loadAttempts.current[videoId] = 0 // Reset attempt counter
      await loadVideo(videoId, videoElement, true)
    },
    [loadVideo],
  )

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }

    setShowControls(true)

    controlsTimeout.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

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
    console.log("🚀 Initializing Video Gallery")
    initializeVideoStates()

    // Test all video URLs
    testAllVideoUrls()

    // Monitor online status
    const handleOnline = () => {
      console.log("🌐 Connection restored")
      setIsOnline(true)
    }
    const handleOffline = () => {
      console.log("📡 Connection lost")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [initializeVideoStates, testAllVideoUrls])

  // Setup video events and intersection observer
  useEffect(() => {
    const cleanups: Array<() => void> = []

    videoRefs.current.forEach((videoElement, index) => {
      if (videoElement) {
        const videoId = videoData[index].id
        videoElement.dataset.videoId = videoId

        const cleanup = setupVideoEvents(videoElement, videoId)
        if (cleanup) cleanups.push(cleanup)
      }
    })

    setupIntersectionObserver()

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect()
      }
    }
  }, [setupVideoEvents, setupIntersectionObserver])

  // Load current video when index changes
  useEffect(() => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (videoElement && currentVideo) {
      const state = videoStates[currentVideo.id]
      if (!state?.isLoaded && !state?.isLoading && !state?.hasError) {
        console.log(`📥 Auto-loading current video ${currentVideo.id}`)
        loadVideo(currentVideo.id, videoElement)
      }
    }
  }, [currentVideoIndex, currentVideo, videoStates, loadVideo])

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black" onMouseMove={resetControlsTimeout}>
      {/* Network Status */}
      {!isOnline && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">No internet connection</span>
        </div>
      )}

      {/* Debug Panel Toggle */}
      <Button
        onClick={() => setShowDebugPanel(!showDebugPanel)}
        className="absolute top-4 left-4 z-50 bg-black/60 text-white hover:bg-black/80"
        size="sm"
      >
        <Settings className="w-4 h-4 mr-1" />
        Debug
      </Button>

      {/* Comprehensive Debug Panel */}
      {showDebugPanel && (
        <div className="absolute top-16 left-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto text-xs">
          <h3 className="font-bold mb-2">🔧 Video Debug Panel</h3>

          <div className="mb-4">
            <h4 className="font-semibold mb-1">📊 Overall Status</h4>
            <div>
              Current Video: {currentVideoIndex + 1}/{videoData.length}
            </div>
            <div>Online: {isOnline ? "✅" : "❌"}</div>
            <div>User Interacted: {hasUserInteracted ? "✅" : "❌"}</div>
          </div>

          {debugInfo.map((info) => {
            const isCurrentVideo = info.videoId === currentVideo?.id
            return (
              <div
                key={info.videoId}
                className={`mb-3 p-2 rounded ${isCurrentVideo ? "bg-blue-900/50" : "bg-gray-800/50"}`}
              >
                <div className="font-semibold flex items-center gap-1">
                  Video {info.videoId}
                  {isCurrentVideo && <span className="text-blue-400">👁️</span>}
                  {info.state.isLoaded && <CheckCircle className="w-3 h-3 text-green-400" />}
                  {info.state.hasError && <XCircle className="w-3 h-3 text-red-400" />}
                  {info.state.isLoading && <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />}
                </div>

                <div className="mt-1 space-y-1">
                  <div>URL: {info.state.urlTested ? (info.state.urlAccessible ? "✅" : "❌") : "⏳"}</div>
                  <div>Ready State: {info.state.readyState}/4</div>
                  <div>Network State: {info.state.networkState}</div>
                  <div>Can Play: {info.state.canPlay ? "✅" : "❌"}</div>
                  <div>Playing: {info.state.isPlaying ? "▶️" : "⏸️"}</div>
                  <div>Muted: {info.state.isMuted ? "🔇" : "🔊"}</div>
                  <div>Load Attempts: {info.loadAttempts}</div>
                  <div>Play Attempts: {info.playAttempts}</div>
                  {info.state.duration > 0 && <div>Duration: {formatTime(info.state.duration)}</div>}
                  {info.state.buffered > 0 && <div>Buffered: {formatTime(info.state.buffered)}</div>}
                  {info.lastError && <div className="text-red-400">Error: {info.lastError}</div>}
                </div>

                <div className="mt-2 flex gap-1">
                  <Button
                    onClick={() => retryVideo(info.videoId)}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    disabled={info.state.isLoading}
                  >
                    Retry
                  </Button>
                  <Button
                    onClick={() => {
                      const element = videoRefs.current[videoData.findIndex((v) => v.id === info.videoId)]
                      if (element) {
                        console.log(`Video ${info.videoId} element:`, element)
                        console.log(`Video ${info.videoId} properties:`, {
                          src: element.src,
                          readyState: element.readyState,
                          networkState: element.networkState,
                          error: element.error,
                          duration: element.duration,
                          currentTime: element.currentTime,
                          paused: element.paused,
                          muted: element.muted,
                          volume: element.volume,
                        })
                      }
                    }}
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Log
                  </Button>
                </div>
              </div>
            )
          })}
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
                className="w-full h-full object-cover"
                poster={video.thumbnail}
                muted={state.isMuted !== false}
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
                loop
                data-video-id={video.id}
                style={{
                  aspectRatio: 9 / 16,
                }}
              />

              {/* Enhanced Loading State */}
              {state.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                  <div className="text-center text-white">
                    <p className="text-lg font-medium mb-1">Loading video {video.id}...</p>
                    <p className="text-sm text-white/70">Ready State: {state.readyState}/4</p>
                    <p className="text-sm text-white/70">Network State: {state.networkState}</p>
                    {loadAttempts.current[video.id] > 1 && (
                      <p className="text-sm text-yellow-400">Attempt {loadAttempts.current[video.id]}/3</p>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Error State */}
              {state.hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
                  <div className="text-center max-w-sm px-4">
                    <AlertTriangle className="w-16 h-16 text-white mb-4 mx-auto" />
                    <h3 className="text-white text-xl font-semibold mb-2">Video {video.id} Error</h3>
                    <p className="text-white/80 text-sm mb-2">{state.errorMessage}</p>
                    <p className="text-white/60 text-xs mb-4">
                      URL Tested:{" "}
                      {state.urlTested
                        ? state.urlAccessible
                          ? "✅ Accessible"
                          : "❌ Not Accessible"
                        : "⏳ Testing..."}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => retryVideo(video.id)}
                        variant="outline"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        disabled={state.retryCount >= 3}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry ({state.retryCount}/3)
                      </Button>
                      <Button
                        onClick={() => testVideoUrl(video.id, video.videoUrl)}
                        variant="outline"
                        className="bg-blue-500/20 border-blue-300/30 text-white hover:bg-blue-500/30"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Test URL
                      </Button>
                      {currentVideoIndex < videoData.length - 1 && (
                        <Button
                          onClick={() => scrollToVideo(currentVideoIndex + 1)}
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          Skip to next
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Play/Pause Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center" onClick={togglePlayPause}>
                {!state.isPlaying && isCurrentVideo && !state.isLoading && !state.hasError && (
                  <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all duration-200 hover:scale-110">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                )}
              </div>

              {/* Enhanced Progress Bar */}
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
                    {state.buffered > 0 && (
                      <div
                        className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-300"
                        style={{ width: `${(state.buffered / state.duration) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Video Status Indicator */}
              {isCurrentVideo && (
                <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                  {state.isLoaded && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {state.hasError && <XCircle className="w-5 h-5 text-red-400" />}
                  {state.isLoading && <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />}
                  <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                    {video.id}
                  </div>
                </div>
              )}

              {/* Rest of the UI components remain the same... */}
              {/* User Info & Description */}
              <div
                className={`absolute bottom-0 left-0 right-20 z-20 p-4 transition-all duration-300 ${
                  showControls || !state.isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={video.avatar || "/placeholder.svg"}
                      alt={video.username}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
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

                  {/* Enhanced Video Stats */}
                  <div className="flex items-center space-x-4 text-white/70 text-xs">
                    <span>{formatCount(video.likes)} likes</span>
                    <span>•</span>
                    <span>{formatCount(video.comments)} comments</span>
                    <span>•</span>
                    <span>{video.duration}s</span>
                    {state.duration > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          {formatTime(state.currentTime)} / {formatTime(state.duration)}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>Ready: {state.readyState}/4</span>
                    {state.urlTested && (
                      <>
                        <span>•</span>
                        <span>URL: {state.urlAccessible ? "✅" : "❌"}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Right Side) */}
              <div
                className={`absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-6 transition-all duration-300 ${
                  showControls || !state.isPlaying ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
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

              {/* Volume Control */}
              <div
                className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${
                  showControls || !state.isPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
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
            </div>
          )
        })}
      </div>

      {/* Video Counter */}
      <div className="absolute top-4 right-4 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {currentVideoIndex + 1}/{videoData.length}
        </span>
      </div>

      {/* Instructions for first-time users */}
      {!hasUserInteracted && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 max-w-xs">
          <p className="text-white text-sm">🎬 Tap the play button or video to start watching!</p>
          <p className="text-white/70 text-xs mt-1">Use the Debug button to see detailed video status</p>
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
      `}</style>
    </div>
  )
}
