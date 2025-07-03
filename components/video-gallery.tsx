"use client"

import type React from "react"
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
  Wifi,
  WifiOff,
  RefreshCw,
  SkipForward,
  Maximize,
  Minimize,
  Share2,
  Signal,
  Zap,
  Clock,
  Download,
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
  fileSize?: number
  quality?: "low" | "medium" | "high"
  aspectRatio?: number
  // Enhanced video metadata
  bitrates?: {
    low: string
    medium: string
    high: string
    auto: string
  }
  resolutions?: {
    "360p": string
    "480p": string
    "720p": string
    "1080p": string
  }
  codec?: string
  fps?: number
}

interface VideoState {
  // Loading states
  isLoading: boolean
  isLoaded: boolean
  hasError: boolean
  errorMessage: string
  retryCount: number
  loadProgress: number
  preloadProgress: number

  // Playback states
  isPlaying: boolean
  isPaused: boolean
  isBuffering: boolean
  currentTime: number
  duration: number
  bufferedRanges: TimeRanges | null
  bufferAhead: number
  stallCount: number

  // Audio/Video states
  volume: number
  isMuted: boolean
  playbackRate: number
  currentQuality: "auto" | "low" | "medium" | "high"

  // UI states
  isFullscreen: boolean
  showControls: boolean
  isVisible: boolean
  isInViewport: boolean

  // Network states
  networkSpeed: number
  bufferHealth: number
  canPlayThrough: boolean
  estimatedBandwidth: number
  adaptiveQuality: string
  downloadSpeed: number
  latency: number
}

interface NetworkInfo {
  isOnline: boolean
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
  connectionQuality: "excellent" | "good" | "fair" | "poor"
}

interface BufferStrategy {
  targetBuffer: number // seconds
  maxBuffer: number // seconds
  rebufferThreshold: number // seconds
  qualityChangeThreshold: number // seconds
}

interface AdaptiveConfig {
  bandwidthSamples: number[]
  qualityLevels: {
    name: string
    minBandwidth: number // kbps
    resolution: string
    bitrate: number
  }[]
  switchUpThreshold: number
  switchDownThreshold: number
}

// Enhanced video data with multiple quality options
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
    quality: "high",
    aspectRatio: 9 / 16,
    fileSize: 12.5, // MB
    codec: "H.264",
    fps: 30,
    bitrates: {
      low: blobAssets.videos.video1 + "?quality=low",
      medium: blobAssets.videos.video1 + "?quality=medium",
      high: blobAssets.videos.video1,
      auto: blobAssets.videos.video1 + "?quality=auto",
    },
    resolutions: {
      "360p": blobAssets.videos.video1 + "?res=360",
      "480p": blobAssets.videos.video1 + "?res=480",
      "720p": blobAssets.videos.video1 + "?res=720",
      "1080p": blobAssets.videos.video1,
    },
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
    quality: "high",
    aspectRatio: 9 / 16,
    fileSize: 10.8,
    codec: "H.264",
    fps: 30,
    bitrates: {
      low: blobAssets.videos.video2 + "?quality=low",
      medium: blobAssets.videos.video2 + "?quality=medium",
      high: blobAssets.videos.video2,
      auto: blobAssets.videos.video2 + "?quality=auto",
    },
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
    quality: "high",
    aspectRatio: 9 / 16,
    fileSize: 15.2,
    codec: "H.264",
    fps: 30,
    bitrates: {
      low: blobAssets.videos.video3 + "?quality=low",
      medium: blobAssets.videos.video3 + "?quality=medium",
      high: blobAssets.videos.video3,
      auto: blobAssets.videos.video3 + "?quality=auto",
    },
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
    quality: "high",
    aspectRatio: 9 / 16,
    fileSize: 9.7,
    codec: "H.264",
    fps: 30,
    bitrates: {
      low: blobAssets.videos.video4 + "?quality=low",
      medium: blobAssets.videos.video4 + "?quality=medium",
      high: blobAssets.videos.video4,
      auto: blobAssets.videos.video4 + "?quality=auto",
    },
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
    quality: "high",
    aspectRatio: 9 / 16,
    fileSize: 11.3,
    codec: "H.264",
    fps: 30,
    bitrates: {
      low: blobAssets.videos.video5 + "?quality=low",
      medium: blobAssets.videos.video5 + "?quality=medium",
      high: blobAssets.videos.video5,
      auto: blobAssets.videos.video5 + "?quality=auto",
    },
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
    quality: "high",
    aspectRatio: 9 / 16,
    fileSize: 13.8,
    codec: "H.264",
    fps: 30,
    bitrates: {
      low: blobAssets.videos.video6 + "?quality=low",
      medium: blobAssets.videos.video6 + "?quality=medium",
      high: blobAssets.videos.video6,
      auto: blobAssets.videos.video6 + "?quality=auto",
    },
  },
]

// Advanced Buffering and Streaming Manager
class VideoStreamManager {
  private bandwidthSamples: number[] = []
  private qualityHistory: string[] = []
  private bufferStrategy: BufferStrategy
  private adaptiveConfig: AdaptiveConfig
  private downloadStartTime = 0
  private downloadedBytes = 0

  constructor() {
    this.bufferStrategy = {
      targetBuffer: 10, // Target 10 seconds ahead
      maxBuffer: 30, // Maximum 30 seconds
      rebufferThreshold: 2, // Switch down if buffer < 2 seconds
      qualityChangeThreshold: 5, // Wait 5 seconds before quality changes
    }

    this.adaptiveConfig = {
      bandwidthSamples: [],
      qualityLevels: [
        { name: "low", minBandwidth: 500, resolution: "360p", bitrate: 500 },
        { name: "medium", minBandwidth: 1500, resolution: "480p", bitrate: 1500 },
        { name: "high", minBandwidth: 3000, resolution: "720p", bitrate: 3000 },
      ],
      switchUpThreshold: 1.5, // Switch up if bandwidth is 1.5x current bitrate
      switchDownThreshold: 0.8, // Switch down if bandwidth is 0.8x current bitrate
    }
  }

  // Estimate bandwidth based on download performance
  estimateBandwidth(bytesLoaded: number, timeElapsed: number): number {
    if (timeElapsed === 0) return 0

    const bitsPerSecond = (bytesLoaded * 8) / timeElapsed
    const kbps = bitsPerSecond / 1000

    this.bandwidthSamples.push(kbps)

    // Keep only last 10 samples for moving average
    if (this.bandwidthSamples.length > 10) {
      this.bandwidthSamples.shift()
    }

    // Return weighted average (recent samples have more weight)
    const weights = this.bandwidthSamples.map((_, i) => i + 1)
    const weightedSum = this.bandwidthSamples.reduce((sum, sample, i) => sum + sample * weights[i], 0)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    return weightedSum / totalWeight
  }

  // Select optimal quality based on bandwidth and buffer health
  selectOptimalQuality(
    currentBandwidth: number,
    bufferHealth: number,
    currentQuality: string,
    networkType: string,
  ): string {
    // Conservative approach for poor connections
    if (networkType === "slow-2g" || networkType === "2g") {
      return "low"
    }

    // Emergency downgrade if buffer is critically low
    if (bufferHealth < this.bufferStrategy.rebufferThreshold) {
      return "low"
    }

    // Find best quality for current bandwidth
    let optimalQuality = "low"

    for (const level of this.adaptiveConfig.qualityLevels) {
      if (currentBandwidth >= level.minBandwidth * this.adaptiveConfig.switchUpThreshold) {
        optimalQuality = level.name
      }
    }

    // Prevent frequent quality switches
    const currentLevel = this.adaptiveConfig.qualityLevels.find((l) => l.name === currentQuality)
    const optimalLevel = this.adaptiveConfig.qualityLevels.find((l) => l.name === optimalQuality)

    if (currentLevel && optimalLevel) {
      // Only switch if there's significant bandwidth difference
      const bandwidthRatio = currentBandwidth / currentLevel.minBandwidth

      if (optimalLevel.minBandwidth > currentLevel.minBandwidth) {
        // Switching up - be conservative
        if (bandwidthRatio < this.adaptiveConfig.switchUpThreshold || bufferHealth < 8) {
          return currentQuality
        }
      } else if (optimalLevel.minBandwidth < currentLevel.minBandwidth) {
        // Switching down - be aggressive to prevent stalls
        if (bandwidthRatio > this.adaptiveConfig.switchDownThreshold && bufferHealth > 5) {
          return currentQuality
        }
      }
    }

    return optimalQuality
  }

  // Calculate buffer health score (0-100)
  calculateBufferHealth(video: HTMLVideoElement): number {
    if (!video.buffered.length || !video.duration) return 0

    const currentTime = video.currentTime
    const bufferedEnd = video.buffered.end(video.buffered.length - 1)
    const bufferAhead = Math.max(0, bufferedEnd - currentTime)

    // Health based on buffer ahead vs target
    const healthScore = Math.min(100, (bufferAhead / this.bufferStrategy.targetBuffer) * 100)

    return healthScore
  }

  // Get preload strategy based on network conditions
  getPreloadStrategy(networkInfo: NetworkInfo, priority: "high" | "medium" | "low"): string {
    if (!networkInfo.isOnline) return "none"

    if (networkInfo.saveData) return "metadata"

    switch (networkInfo.effectiveType) {
      case "slow-2g":
      case "2g":
        return priority === "high" ? "metadata" : "none"
      case "3g":
        return priority === "high" ? "auto" : "metadata"
      case "4g":
      default:
        return priority === "low" ? "metadata" : "auto"
    }
  }

  // Progressive loading with chunk-based approach
  async loadVideoProgressively(
    video: HTMLVideoElement,
    url: string,
    onProgress: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      let lastLoaded = 0

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const loaded = video.buffered.end(0)
          const total = video.duration || video.seekable.end(0) || 100
          const progress = (loaded / total) * 100

          onProgress(Math.min(100, progress))

          // Estimate download speed
          const currentTime = Date.now()
          const timeElapsed = (currentTime - startTime) / 1000
          const bytesLoaded = (loaded - lastLoaded) * 1024 * 1024 // Rough estimate

          if (bytesLoaded > 0 && timeElapsed > 0) {
            this.estimateBandwidth(bytesLoaded, timeElapsed)
          }

          lastLoaded = loaded
        }
      }

      const handleCanPlay = () => {
        onProgress(75)
        resolve()
      }

      const handleError = () => {
        reject(new Error("Progressive loading failed"))
      }

      video.addEventListener("progress", handleProgress)
      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("error", handleError)

      video.src = url
      video.load()

      // Cleanup listeners
      const cleanup = () => {
        video.removeEventListener("progress", handleProgress)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("error", handleError)
      }

      // Timeout for slow connections
      setTimeout(() => {
        cleanup()
        reject(new Error("Progressive loading timeout"))
      }, 30000)
    })
  }
}

export default function VideoGallery() {
  // Core state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({})
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: true,
    effectiveType: "4g",
    downlink: 10,
    rtt: 100,
    saveData: false,
    connectionQuality: "excellent",
  })

  // Enhanced streaming state
  const [streamManager] = useState(() => new VideoStreamManager())
  const [globalBandwidth, setGlobalBandwidth] = useState(0)
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(true)
  const [preloadQueue, setPreloadQueue] = useState<string[]>([])
  const [qualityOverride, setQualityOverride] = useState<string | null>(null)

  // UI state
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())
  const [globalShowControls, setGlobalShowControls] = useState(true)
  const [isFullscreenMode, setIsFullscreenMode] = useState(false)
  const [showQualitySettings, setShowQualitySettings] = useState(false)

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
  const bandwidthMonitor = useRef<NodeJS.Timeout>()
  const qualityChangeTimeout = useRef<Record<string, NodeJS.Timeout>>({})

  const { toast } = useToast()
  const currentVideo = videoData[currentVideoIndex]
  const currentVideoState = videoStates[currentVideo?.id] || {}

  // Initialize video states with enhanced properties
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
        preloadProgress: 0,

        // Playback states
        isPlaying: false,
        isPaused: true,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
        bufferedRanges: null,
        bufferAhead: 0,
        stallCount: 0,

        // Audio/Video states
        volume: 75,
        isMuted: true,
        playbackRate: 1,
        currentQuality: "auto",

        // UI states
        isFullscreen: false,
        showControls: true,
        isVisible: false,
        isInViewport: false,

        // Network states
        networkSpeed: 0,
        bufferHealth: 0,
        canPlayThrough: false,
        estimatedBandwidth: 0,
        adaptiveQuality: "medium",
        downloadSpeed: 0,
        latency: 0,
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

  // Enhanced network monitoring with quality assessment
  const monitorNetwork = useCallback(() => {
    const updateNetworkInfo = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      let connectionQuality: "excellent" | "good" | "fair" | "poor" = "good"
      let effectiveType = "4g"
      let downlink = 10
      let rtt = 100
      let saveData = false

      if (connection) {
        effectiveType = connection.effectiveType || "4g"
        downlink = connection.downlink || 10
        rtt = connection.rtt || 100
        saveData = connection.saveData || false

        // Assess connection quality
        if (effectiveType === "4g" && downlink > 5 && rtt < 150) {
          connectionQuality = "excellent"
        } else if (effectiveType === "4g" || (effectiveType === "3g" && downlink > 2)) {
          connectionQuality = "good"
        } else if (effectiveType === "3g" || effectiveType === "2g") {
          connectionQuality = "fair"
        } else {
          connectionQuality = "poor"
        }
      }

      setNetworkInfo({
        isOnline: navigator.onLine,
        effectiveType,
        downlink,
        rtt,
        saveData,
        connectionQuality,
      })
    }

    const handleOnline = () => {
      updateNetworkInfo()
      toast({
        title: "🌐 Connection restored",
        description: "Resuming video streaming with adaptive quality",
      })
    }

    const handleOffline = () => {
      updateNetworkInfo()
      toast({
        title: "📡 Connection lost",
        description: "Videos paused until connection returns",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

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

  // Enhanced video loading with adaptive streaming
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
        preloadProgress: 0,
      })

      try {
        // Determine optimal quality
        const currentBandwidth = globalBandwidth || networkInfo.downlink * 1000
        const bufferHealth = streamManager.calculateBufferHealth(videoElement)
        const optimalQuality =
          qualityOverride ||
          streamManager.selectOptimalQuality(
            currentBandwidth,
            bufferHealth,
            currentVideoState.currentQuality || "auto",
            networkInfo.effectiveType,
          )

        // Select video URL based on quality
        let videoUrl = video.videoUrl
        if (video.bitrates && optimalQuality !== "auto") {
          videoUrl = video.bitrates[optimalQuality as keyof typeof video.bitrates] || video.videoUrl
        }

        // Configure video element for optimal streaming
        videoElement.preload = streamManager.getPreloadStrategy(networkInfo, priority)
        videoElement.playsInline = true
        videoElement.muted = false
        videoElement.crossOrigin = "anonymous"
        videoElement.volume = 0.75

        // Enhanced buffering configuration
        if ("buffered" in videoElement) {
          // Set buffer size based on network quality
          const bufferSize =
            networkInfo.connectionQuality === "excellent" ? 30 : networkInfo.connectionQuality === "good" ? 20 : 10
          videoElement.setAttribute("preload", priority === "high" ? "auto" : "metadata")
        }

        // Progressive loading with bandwidth monitoring
        await streamManager.loadVideoProgressively(videoElement, videoUrl, (progress) => {
          updateVideoState(videoId, {
            loadProgress: progress,
            preloadProgress: progress,
          })
        })

        updateVideoState(videoId, {
          isLoaded: true,
          isLoading: false,
          currentQuality: optimalQuality as any,
          adaptiveQuality: optimalQuality,
        })

        // Clear loading timeout
        if (loadingTimeouts.current[videoId]) {
          clearTimeout(loadingTimeouts.current[videoId])
        }
      } catch (error) {
        console.error(`Enhanced loading failed for video ${videoId}:`, error)
        updateVideoState(videoId, {
          isLoading: false,
          hasError: true,
          errorMessage: "Failed to load video with adaptive streaming",
        })
      }
    },
    [networkInfo, globalBandwidth, qualityOverride, currentVideoState, streamManager, updateVideoState],
  )

  // Intelligent preloading queue management
  const managePreloadQueue = useCallback(() => {
    if (!networkInfo.isOnline || networkInfo.saveData) return

    const currentIndex = currentVideoIndex
    const preloadIndices: number[] = []

    // Preload strategy based on network quality
    switch (networkInfo.connectionQuality) {
      case "excellent":
        // Preload current + next 2 + previous 1
        preloadIndices.push(currentIndex, currentIndex + 1, currentIndex + 2, currentIndex - 1)
        break
      case "good":
        // Preload current + next 1
        preloadIndices.push(currentIndex, currentIndex + 1)
        break
      case "fair":
        // Only preload current
        preloadIndices.push(currentIndex)
        break
      case "poor":
        // No preloading
        break
    }

    // Filter valid indices and convert to video IDs
    const validIndices = preloadIndices.filter((i) => i >= 0 && i < videoData.length)
    const newQueue = validIndices.map((i) => videoData[i].id)

    setPreloadQueue(newQueue)

    // Start preloading
    newQueue.forEach((videoId, index) => {
      const state = videoStates[videoId]
      if (!state?.isLoaded && !state?.isLoading) {
        const priority = index === 0 ? "high" : index === 1 ? "medium" : "low"
        setTimeout(() => loadVideo(videoId, priority), index * 500) // Stagger loading
      }
    })
  }, [currentVideoIndex, networkInfo, videoStates, loadVideo])

  // Bandwidth monitoring and adaptive quality adjustment
  useEffect(() => {
    if (!adaptiveEnabled) return

    bandwidthMonitor.current = setInterval(() => {
      const currentVideoElement = videoRefs.current[currentVideoIndex]
      if (!currentVideoElement || !currentVideo) return

      const bufferHealth = streamManager.calculateBufferHealth(currentVideoElement)
      const estimatedBandwidth = streamManager.estimateBandwidth(
        currentVideoElement.buffered.length > 0 ? currentVideoElement.buffered.end(0) * 1024 * 1024 : 0,
        currentVideoElement.currentTime,
      )

      setGlobalBandwidth(estimatedBandwidth)

      updateVideoState(currentVideo.id, {
        bufferHealth,
        estimatedBandwidth,
        bufferAhead:
          currentVideoElement.buffered.length > 0
            ? Math.max(0, currentVideoElement.buffered.end(0) - currentVideoElement.currentTime)
            : 0,
      })

      // Adaptive quality switching
      if (!qualityOverride) {
        const currentQuality = currentVideoState.currentQuality || "auto"
        const optimalQuality = streamManager.selectOptimalQuality(
          estimatedBandwidth,
          bufferHealth,
          currentQuality,
          networkInfo.effectiveType,
        )

        if (optimalQuality !== currentQuality && !qualityChangeTimeout.current[currentVideo.id]) {
          // Debounce quality changes
          qualityChangeTimeout.current[currentVideo.id] = setTimeout(() => {
            if (bufferHealth < 20 || estimatedBandwidth < 1000) {
              // Emergency quality downgrade
              switchVideoQuality(currentVideo.id, "low")
            } else if (optimalQuality !== currentQuality) {
              switchVideoQuality(currentVideo.id, optimalQuality)
            }
            delete qualityChangeTimeout.current[currentVideo.id]
          }, 3000)
        }
      }
    }, 2000)

    return () => {
      if (bandwidthMonitor.current) {
        clearInterval(bandwidthMonitor.current)
      }
    }
  }, [
    currentVideoIndex,
    currentVideo,
    currentVideoState,
    adaptiveEnabled,
    qualityOverride,
    networkInfo,
    streamManager,
    updateVideoState,
  ])

  // Switch video quality smoothly
  const switchVideoQuality = useCallback(
    async (videoId: string, newQuality: string) => {
      const video = videoData.find((v) => v.id === videoId)
      const videoElement = videoRefs.current[videoData.findIndex((v) => v.id === videoId)]

      if (!video || !videoElement || !video.bitrates) return

      const currentTime = videoElement.currentTime
      const wasPlaying = !videoElement.paused

      try {
        // Get new quality URL
        const newUrl = video.bitrates[newQuality as keyof typeof video.bitrates] || video.videoUrl

        // Smooth transition
        updateVideoState(videoId, { isBuffering: true })

        videoElement.src = newUrl
        videoElement.currentTime = currentTime

        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            videoElement.removeEventListener("canplay", handleCanPlay)
            resolve(void 0)
          }
          const handleError = () => {
            videoElement.removeEventListener("error", handleError)
            reject(new Error("Quality switch failed"))
          }

          videoElement.addEventListener("canplay", handleCanPlay)
          videoElement.addEventListener("error", handleError)
          videoElement.load()
        })

        if (wasPlaying) {
          await videoElement.play()
        }

        updateVideoState(videoId, {
          currentQuality: newQuality as any,
          adaptiveQuality: newQuality,
          isBuffering: false,
        })

        toast({
          title: `📺 Quality: ${newQuality.toUpperCase()}`,
          description: `Switched to ${newQuality} quality for optimal streaming`,
        })
      } catch (error) {
        console.error("Quality switch failed:", error)
        updateVideoState(videoId, { isBuffering: false })
      }
    },
    [updateVideoState, toast],
  )

  // Enhanced video event handling with buffer monitoring
  const setupVideoEvents = useCallback(
    (videoElement: HTMLVideoElement, videoId: string) => {
      const video = videoData.find((v) => v.id === videoId)
      if (!video) return

      // Enhanced buffer monitoring
      const handleProgress = () => {
        if (videoElement.buffered.length > 0) {
          const bufferHealth = streamManager.calculateBufferHealth(videoElement)
          const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1)
          const bufferAhead = Math.max(0, bufferedEnd - videoElement.currentTime)

          updateVideoState(videoId, {
            bufferedRanges: videoElement.buffered,
            bufferHealth,
            bufferAhead,
            canPlayThrough: bufferAhead > 10, // Can play through if 10+ seconds buffered
          })

          // Adaptive preloading based on buffer health
          if (bufferHealth > 80 && videoId === currentVideo?.id) {
            managePreloadQueue()
          }
        }
      }

      // Stall detection and recovery
      const handleWaiting = () => {
        updateVideoState(videoId, {
          isBuffering: true,
          stallCount: (videoStates[videoId]?.stallCount || 0) + 1,
        })

        // Auto-recovery for frequent stalls
        const stallCount = videoStates[videoId]?.stallCount || 0
        if (stallCount > 3) {
          toast({
            title: "🔄 Auto-optimizing",
            description: "Switching to lower quality for smoother playback",
          })
          switchVideoQuality(videoId, "low")
        }
      }

      const handlePlaying = () => {
        updateVideoState(videoId, {
          isBuffering: false,
          stallCount: 0, // Reset stall count on successful playback
        })
      }

      // Enhanced error handling with recovery strategies
      const handleError = () => {
        const error = videoElement.error
        let errorMessage = "Unknown error occurred"
        let recoveryAction = null

        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error - trying lower quality"
              recoveryAction = () => switchVideoQuality(videoId, "low")
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Video decoding error - switching format"
              recoveryAction = () => {
                // Try alternative URL or format
                const altUrl = video.bitrates?.low || video.videoUrl
                videoElement.src = altUrl
                videoElement.load()
              }
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Video format not supported"
              break
            default:
              errorMessage = "Playback error occurred"
          }
        }

        updateVideoState(videoId, {
          isLoading: false,
          hasError: true,
          errorMessage,
          isPlaying: false,
        })

        // Attempt recovery
        if (recoveryAction) {
          setTimeout(recoveryAction, 1000)
        }

        console.error(`Enhanced video error for ${videoId}:`, error)
      }

      // Bandwidth estimation during loading
      const handleLoadStart = () => {
        updateVideoState(videoId, {
          isLoading: true,
          loadProgress: 0,
          downloadSpeed: 0,
        })
      }

      const handleLoadedMetadata = () => {
        updateVideoState(videoId, {
          duration: videoElement.duration,
          loadProgress: 25,
        })
      }

      const handleCanPlay = () => {
        updateVideoState(videoId, {
          isLoaded: true,
          isLoading: false,
          loadProgress: 75,
        })
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

      const handleTimeUpdate = () => {
        updateVideoState(videoId, { currentTime: videoElement.currentTime })
      }

      const handleDurationChange = () => {
        updateVideoState(videoId, { duration: videoElement.duration })
      }

      const handleVolumeChange = () => {
        updateVideoState(videoId, {
          volume: Math.round(videoElement.volume * 100),
          isMuted: videoElement.muted,
        })
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

      // Add all event listeners
      const events = [
        ["loadstart", handleLoadStart],
        ["loadedmetadata", handleLoadedMetadata],
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
        ["ended", handleEnded],
        ["volumechange", handleVolumeChange],
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
    [updateVideoState, streamManager, currentVideo, videoStates, managePreloadQueue, switchVideoQuality, toast],
  )

  // Scroll to video with preload management
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

      // Trigger preload queue update
      setTimeout(() => managePreloadQueue(), 100)
    },
    [managePreloadQueue],
  )

  // Enhanced intersection observer with viewport tracking
  const setupIntersectionObserver = useCallback(() => {
    const options = {
      root: null,
      rootMargin: "100px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }

    intersectionObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement
        const videoId = videoElement.dataset.videoId
        if (!videoId) return

        const isVisible = entry.isIntersecting
        const visibilityRatio = entry.intersectionRatio

        updateVideoState(videoId, {
          isVisible,
          isInViewport: visibilityRatio > 0.1,
        })

        if (isVisible && visibilityRatio > 0.1) {
          const state = videoStates[videoId]
          if (!state?.isLoaded && !state?.isLoading && !state?.hasError) {
            const priority = visibilityRatio > 0.7 ? "high" : "medium"
            loadVideo(videoId, priority)
          }

          // Enhanced autoplay with quality consideration
          if (isVisible && visibilityRatio > 0.7 && videoId === currentVideo?.id) {
            const state = videoStates[videoId]
            if (state?.isLoaded && !state?.isPlaying && !state?.hasError && state.bufferHealth > 30) {
              videoElement.muted = false
              videoElement.play().catch(async (error) => {
                console.log("Autoplay with audio blocked:", error)
                videoElement.muted = true
                try {
                  await videoElement.play()
                  toast({
                    title: "🔇 Playing muted",
                    description: "Tap volume to enable sound",
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

    videoRefs.current.forEach((video) => {
      if (video && intersectionObserver.current) {
        intersectionObserver.current.observe(video)
      }
    })
  }, [videoStates, currentVideo, loadVideo, updateVideoState, toast])

  // Rest of the component methods remain the same...
  // (togglePlayPause, toggleMute, adjustVolume, etc.)

  const togglePlayPause = useCallback(async () => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement || !currentVideo) return

    const state = currentVideoState

    if (state.hasError) {
      // Retry with lower quality
      await switchVideoQuality(currentVideo.id, "low")
      return
    }

    if (!state.isLoaded) {
      toast({
        title: "⏳ Loading...",
        description: "Video is still loading, please wait",
      })
      return
    }

    // Check buffer health before playing
    if (!state.isPlaying && state.bufferHealth < 10) {
      toast({
        title: "📶 Buffering...",
        description: "Building buffer for smooth playback",
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
        title: "⚠️ Playback Error",
        description: "Trying lower quality for better performance",
        variant: "destructive",
      })
      await switchVideoQuality(currentVideo.id, "low")
    }
  }, [currentVideoIndex, currentVideo, currentVideoState, switchVideoQuality, toast])

  const toggleMute = useCallback(() => {
    const videoElement = videoRefs.current[currentVideoIndex]
    if (!videoElement || !currentVideo) return

    const currentState = currentVideoState

    if (currentState.isMuted) {
      videoElement.muted = false
      const targetVolume = currentState.volume > 0 ? currentState.volume : 75
      videoElement.volume = targetVolume / 100

      toast({
        title: "🔊 Audio enabled",
        description: `Volume restored to ${targetVolume}%`,
      })
    } else {
      videoElement.muted = true
      toast({
        title: "🔇 Audio muted",
        description: "Click volume to unmute",
      })
    }
  }, [currentVideoIndex, currentVideo, currentVideoState, toast])

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

  // Touch handling (same as before)
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

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentVideoIndex < videoData.length - 1) {
          scrollToVideo(currentVideoIndex + 1)
        } else if (deltaY < 0 && currentVideoIndex > 0) {
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

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
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

  // Preload queue management
  useEffect(() => {
    managePreloadQueue()
  }, [currentVideoIndex, networkInfo, managePreloadQueue])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
      if (bandwidthMonitor.current) {
        clearInterval(bandwidthMonitor.current)
      }
      Object.values(retryTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
      Object.values(loadingTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
      Object.values(qualityChangeTimeout.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Network Status */}
      {!networkInfo.isOnline && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">No internet connection</span>
        </div>
      )}

      {/* Enhanced Network Quality Indicator */}
      <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-2">
        <div className="flex items-center gap-1">
          {networkInfo.connectionQuality === "excellent" && <Signal className="w-3 h-3 text-green-400" />}
          {networkInfo.connectionQuality === "good" && <Wifi className="w-3 h-3 text-blue-400" />}
          {networkInfo.connectionQuality === "fair" && <Wifi className="w-3 h-3 text-yellow-400" />}
          {networkInfo.connectionQuality === "poor" && <Wifi className="w-3 h-3 text-red-400" />}
          <span className="text-xs capitalize">{networkInfo.effectiveType}</span>
        </div>
        {globalBandwidth > 0 && <div className="text-xs text-white/70">{Math.round(globalBandwidth)} kbps</div>}
      </div>

      {/* Adaptive Quality Indicator */}
      {currentVideoState.currentQuality && (
        <div className="absolute top-4 right-4 z-40 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span className="text-xs uppercase">{currentVideoState.currentQuality}</span>
          {adaptiveEnabled && <span className="text-xs text-green-400">AUTO</span>}
        </div>
      )}

      {/* Buffer Health Indicator */}
      {currentVideoState.bufferHealth !== undefined && currentVideoState.isVisible && (
        <div className="absolute top-12 right-4 z-40">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-2">
            <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentVideoState.bufferHealth > 70
                    ? "bg-green-500"
                    : currentVideoState.bufferHealth > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${currentVideoState.bufferHealth}%` }}
              />
            </div>
            <span className="text-white text-xs">{Math.round(currentVideoState.bufferHealth)}%</span>
          </div>
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

              {/* Enhanced Loading State */}
              {state.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                  <div className="relative mb-4">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                    {state.loadProgress > 0 && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full overflow-hidden">
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
                    {state.estimatedBandwidth > 0 && (
                      <p className="text-xs text-white/50">
                        {Math.round(state.estimatedBandwidth)} kbps • {state.adaptiveQuality} quality
                      </p>
                    )}
                    {video.fileSize && (
                      <p className="text-xs text-white/50">{formatBytes(video.fileSize * 1024 * 1024)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Buffering State */}
              {state.isBuffering && !state.isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <span className="text-white text-sm mb-2">Buffering...</span>
                  {state.bufferHealth > 0 && (
                    <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-white/60 transition-all duration-300"
                        style={{ width: `${state.bufferHealth}%` }}
                      />
                    </div>
                  )}
                  {state.stallCount > 0 && (
                    <p className="text-xs text-white/70">Optimizing quality... ({state.stallCount} stalls)</p>
                  )}
                </div>
              )}

              {/* Enhanced Error State */}
              {state.hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
                  <div className="text-center max-w-sm px-4">
                    {!networkInfo.isOnline ? (
                      <WifiOff className="w-16 h-16 text-white mb-4 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-16 h-16 text-white mb-4 mx-auto" />
                    )}
                    <h3 className="text-white text-xl font-semibold mb-2">
                      {!networkInfo.isOnline ? "No Connection" : "Streaming Error"}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">{state.errorMessage || "Unable to load video"}</p>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => switchVideoQuality(video.id, "low")}
                        variant="outline"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        disabled={state.retryCount >= 3}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Lower Quality
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
              )}

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
                    <div
                      className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-300"
                      style={{ width: `${state.bufferHealth}%` }}
                    />
                    {/* Preload progress */}
                    {state.preloadProgress > 0 && (
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-400/40 transition-all duration-300"
                        style={{ width: `${state.preloadProgress}%` }}
                      />
                    )}
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

                  {/* Enhanced Video Stats */}
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
                          <Signal className="w-3 h-3" />
                          <span className="text-xs capitalize">{state.adaptiveQuality}</span>
                        </div>
                      </>
                    )}
                    {video.fileSize && (
                      <>
                        <span>•</span>
                        <span>{formatBytes(video.fileSize * 1024 * 1024)}</span>
                      </>
                    )}
                    {state.estimatedBandwidth > 0 && (
                      <>
                        <span>•</span>
                        <span>{Math.round(state.estimatedBandwidth)} kbps</span>
                      </>
                    )}
                  </div>

                  {/* Enhanced Playback Controls */}
                  {isCurrentVideo && state.duration > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-white/70 text-xs font-mono">
                          {formatTime(state.currentTime)} / {formatTime(state.duration)}
                        </span>

                        {/* Buffer ahead indicator */}
                        {state.bufferAhead > 0 && (
                          <div className="flex items-center gap-1 text-white/50 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>+{Math.round(state.bufferAhead)}s</span>
                          </div>
                        )}
                      </div>

                      {/* Quality Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQualitySettings(!showQualitySettings)}
                          className="text-xs h-6 px-2 text-white/70 hover:text-white"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          {state.currentQuality?.toUpperCase()}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAdaptiveEnabled(!adaptiveEnabled)}
                          className={`text-xs h-6 px-2 ${adaptiveEnabled ? "text-green-400" : "text-white/70"}`}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          AUTO
                        </Button>
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

                {/* Download Button (for offline viewing) */}
                <button className="flex flex-col items-center space-y-1 group">
                  <Download className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
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
                      onClick={() => setIsFullscreenMode(!isFullscreenMode)}
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

              {/* Quality Settings Panel */}
              {showQualitySettings && isCurrentVideo && (
                <div className="absolute bottom-20 right-4 z-30 bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-[150px]">
                  <div className="text-white text-sm font-medium mb-2">Video Quality</div>
                  <div className="space-y-1">
                    {["auto", "high", "medium", "low"].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => {
                          if (quality === "auto") {
                            setQualityOverride(null)
                            setAdaptiveEnabled(true)
                          } else {
                            setQualityOverride(quality)
                            setAdaptiveEnabled(false)
                            switchVideoQuality(video.id, quality)
                          }
                          setShowQualitySettings(false)
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                          (quality === "auto" && adaptiveEnabled) ||
                          (quality === state.currentQuality && !adaptiveEnabled)
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        {quality === "auto" && <span className="text-xs text-green-400 ml-1">ADAPTIVE</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
      <div className="absolute top-12 right-4 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {currentVideoIndex + 1}/{videoData.length}
        </span>
      </div>

      {/* Enhanced Loading Summary */}
      {Object.values(videoStates).some((state) => state.isLoading) && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span className="text-white text-sm">
              Loading {Object.values(videoStates).filter((state) => state.isLoading).length} videos...
            </span>
          </div>
          {preloadQueue.length > 0 && (
            <div className="text-xs text-white/70 mt-1">Queue: {preloadQueue.length} videos</div>
          )}
        </div>
      )}

      {/* Streaming Performance Stats */}
      {currentVideoState.estimatedBandwidth > 0 && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <span>{Math.round(currentVideoState.estimatedBandwidth)} kbps</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{Math.round(currentVideoState.bufferAhead || 0)}s buffer</span>
            </div>
            {currentVideoState.stallCount > 0 && (
              <div className="text-red-400">{currentVideoState.stallCount} stalls</div>
            )}
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

        /* Enhanced smooth transitions */
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

        /* Video optimizations for smooth streaming */
        video {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          image-rendering: optimizeSpeed;
          image-rendering: -webkit-optimize-contrast;
        }

        /* Enhanced fullscreen optimizations */
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

        /* Buffer progress animations */
        @keyframes buffer-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .buffer-indicator {
          animation: buffer-pulse 2s ease-in-out infinite;
        }

        /* Quality transition effects */
        .quality-transition {
          transition: filter 0.3s ease-in-out;
        }

        .quality-switching {
          filter: blur(1px);
        }
      `}</style>
    </div>
  )
}
