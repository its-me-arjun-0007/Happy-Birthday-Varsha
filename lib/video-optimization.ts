// Video optimization utilities for better performance
export class VideoOptimizer {
  private static instance: VideoOptimizer
  private preloadCache = new Map<string, HTMLVideoElement>()
  private networkQuality: "fast" | "slow" | "offline" = "fast"

  static getInstance(): VideoOptimizer {
    if (!VideoOptimizer.instance) {
      VideoOptimizer.instance = new VideoOptimizer()
    }
    return VideoOptimizer.instance
  }

  // Detect network quality
  async detectNetworkQuality(): Promise<"fast" | "slow" | "offline"> {
    try {
      // Use Network Information API if available
      if ("connection" in navigator) {
        const connection = (navigator as any).connection
        const effectiveType = connection.effectiveType

        if (effectiveType === "4g") return "fast"
        if (effectiveType === "3g") return "slow"
        if (effectiveType === "2g" || effectiveType === "slow-2g") return "slow"
      }

      // Fallback: Simple speed test
      const startTime = Date.now()
      const response = await fetch("/placeholder.svg?cache=" + Math.random(), {
        method: "HEAD",
        cache: "no-cache",
      })
      const endTime = Date.now()

      if (!response.ok) return "offline"

      const duration = endTime - startTime
      return duration < 500 ? "fast" : "slow"
    } catch {
      return "offline"
    }
  }

  // Preload video with smart caching
  preloadVideo(url: string, priority: "high" | "low" = "low"): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      if (this.preloadCache.has(url)) {
        resolve(this.preloadCache.get(url)!)
        return
      }

      const video = document.createElement("video")
      video.preload = this.networkQuality === "fast" ? "auto" : "metadata"
      video.crossOrigin = "anonymous"
      video.muted = true // Required for autoplay policies

      const handleLoad = () => {
        this.preloadCache.set(url, video)
        resolve(video)
        cleanup()
      }

      const handleError = () => {
        reject(new Error(`Failed to preload video: ${url}`))
        cleanup()
      }

      const cleanup = () => {
        video.removeEventListener("loadedmetadata", handleLoad)
        video.removeEventListener("error", handleError)
      }

      video.addEventListener("loadedmetadata", handleLoad)
      video.addEventListener("error", handleError)

      video.src = url
      video.load()

      // Timeout for low priority preloads
      if (priority === "low") {
        setTimeout(() => {
          if (!this.preloadCache.has(url)) {
            cleanup()
            reject(new Error("Preload timeout"))
          }
        }, 10000)
      }
    })
  }

  // Get optimal video settings based on network
  getOptimalSettings() {
    return {
      preload: this.networkQuality === "fast" ? "auto" : "metadata",
      bufferSize: this.networkQuality === "fast" ? 30 : 10, // seconds
      quality: this.networkQuality === "fast" ? "high" : "medium",
      enablePreloading: this.networkQuality === "fast",
    }
  }

  // Clear cache to free memory
  clearCache() {
    this.preloadCache.clear()
  }

  // Update network quality
  updateNetworkQuality(quality: "fast" | "slow" | "offline") {
    this.networkQuality = quality
  }
}

// Utility functions for video optimization
export const videoUtils = {
  // Format bytes to human readable
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },

  // Estimate video file size based on duration and quality
  estimateFileSize: (durationSeconds: number, quality: "low" | "medium" | "high"): string => {
    const bitrates = {
      low: 500000, // 500 kbps
      medium: 1500000, // 1.5 Mbps
      high: 3000000, // 3 Mbps
    }

    const estimatedBytes = (durationSeconds * bitrates[quality]) / 8
    return videoUtils.formatFileSize(estimatedBytes)
  },

  // Check if video can play through without buffering
  canPlayThrough: (video: HTMLVideoElement): boolean => {
    if (!video.buffered.length) return false

    const bufferedEnd = video.buffered.end(video.buffered.length - 1)
    const remainingTime = video.duration - video.currentTime
    const bufferAhead = bufferedEnd - video.currentTime

    // Consider playable if we have at least 10 seconds buffered ahead
    return bufferAhead >= Math.min(10, remainingTime)
  },
}
