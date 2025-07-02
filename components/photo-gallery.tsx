"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Wifi,
  ImageIcon,
  Search,
  Filter,
  XIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { blobAssets } from "@/lib/blob-assets"

interface InstagramPost {
  id: string
  username: string
  userAvatar: string
  isVerified: boolean
  location?: string
  images: string[]
  caption: string
  hashtags: string[]
  likes: number
  comments: Comment[]
  timeAgo: string
  isLiked: boolean
  isSaved: boolean
  category: string
  quality: "high" | "medium" | "low"
  dimensions: { width: number; height: number }
  fileSize?: number
  alt: string
}

interface Comment {
  id: string
  username: string
  text: string
  timeAgo: string
  likes: number
  isLiked: boolean
}

interface ImageLoadState {
  loading: boolean
  loaded: boolean
  error: boolean
  retryCount: number
  progress: number
}

// Enhanced photo data with comprehensive metadata
const instagramPosts: InstagramPost[] = [
  {
    id: "1",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo1,
    isVerified: true,
    location: "Home Sweet Home",
    images: [blobAssets.photos.photo1],
    caption:
      "Embracing the beauty of coral florals and golden hour vibes! ✨🌸 Sometimes the simplest moments create the most beautiful memories.",
    hashtags: ["#coral", "#florals", "#goldenhour", "#natural", "#beauty", "#memories", "#peaceful"],
    likes: 3847,
    comments: [
      {
        id: "1",
        username: "bestfriend_sara",
        text: "You look absolutely radiant! 😍✨",
        timeAgo: "2h",
        likes: 24,
        isLiked: false,
      },
      {
        id: "2",
        username: "mom_love",
        text: "My beautiful daughter, always glowing! ❤️",
        timeAgo: "1h",
        likes: 45,
        isLiked: true,
      },
    ],
    timeAgo: "3 hours ago",
    isLiked: false,
    isSaved: false,
    category: "portrait",
    quality: "high",
    dimensions: { width: 1080, height: 1920 },
    fileSize: 2.4,
    alt: "Varsha in coral floral top, thoughtful pose with hand near face, natural outdoor lighting",
  },
  {
    id: "2",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo2,
    isVerified: true,
    location: "Home Sweet Home",
    images: [blobAssets.photos.photo2],
    caption:
      "Fresh mint vibes and natural glow! 🌿✨ Embracing the simple beauty of everyday moments with a touch of traditional elegance.",
    hashtags: ["#mint", "#natural", "#glow", "#traditional", "#bindi", "#fresh", "#simple", "#elegant"],
    likes: 4156,
    comments: [
      {
        id: "1",
        username: "fashion_guru",
        text: "That natural glow is everything! 💚",
        timeAgo: "4h",
        likes: 31,
        isLiked: false,
      },
      {
        id: "2",
        username: "cousin_priya",
        text: "Love the traditional touch with the bindi! 🌟",
        timeAgo: "3h",
        likes: 28,
        isLiked: true,
      },
    ],
    timeAgo: "6 hours ago",
    isLiked: true,
    isSaved: true,
    category: "selfie",
    quality: "high",
    dimensions: { width: 1080, height: 1920 },
    fileSize: 2.1,
    alt: "Varsha in mint green t-shirt, natural selfie with bindi, soft indoor lighting",
  },
  {
    id: "3",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo3,
    isVerified: true,
    location: "Favorite Cafe",
    images: [blobAssets.photos.photo3],
    caption:
      "Cafe vibes in my favorite patterned shirt! ☕✨ There's something magical about finding beauty in everyday places and moments.",
    hashtags: ["#cafe", "#patterns", "#white", "#elegant", "#coffee", "#moments", "#style", "#classic"],
    likes: 3892,
    comments: [
      {
        id: "1",
        username: "cafe_lover",
        text: "Perfect cafe aesthetic! That shirt is gorgeous 🤍",
        timeAgo: "5h",
        likes: 19,
        isLiked: false,
      },
      {
        id: "2",
        username: "style_icon",
        text: "Classic elegance at its finest! 👑",
        timeAgo: "4h",
        likes: 33,
        isLiked: true,
      },
    ],
    timeAgo: "8 hours ago",
    isLiked: true,
    isSaved: false,
    category: "lifestyle",
    quality: "high",
    dimensions: { width: 1080, height: 1920 },
    fileSize: 2.8,
    alt: "Varsha in white patterned shirt at cafe, elegant pose with warm ambient lighting",
  },
  {
    id: "4",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo4,
    isVerified: true,
    location: "Home Sweet Home",
    images: [blobAssets.photos.photo4],
    caption:
      "Purple power and playful vibes! 💜✨ Sometimes you just need to let your inner child shine through with some fun poses and bright colors!",
    hashtags: ["#purple", "#playful", "#fun", "#vibes", "#bright", "#colors", "#joy", "#energy", "#positive"],
    likes: 5234,
    comments: [
      {
        id: "1",
        username: "color_enthusiast",
        text: "Purple looks amazing on you! Such positive energy 💜",
        timeAgo: "6h",
        likes: 42,
        isLiked: false,
      },
      {
        id: "2",
        username: "happy_vibes",
        text: "Your playful energy is contagious! Love this 🌟",
        timeAgo: "5h",
        likes: 38,
        isLiked: true,
      },
    ],
    timeAgo: "10 hours ago",
    isLiked: false,
    isSaved: true,
    category: "fun",
    quality: "high",
    dimensions: { width: 1080, height: 1920 },
    fileSize: 2.6,
    alt: "Varsha in purple t-shirt, playful pose with hand gestures, bright indoor lighting",
  },
  {
    id: "5",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo5,
    isVerified: true,
    location: "Outdoor Bliss",
    images: [blobAssets.photos.photo5],
    caption:
      "Blue stripes and natural light creating the perfect outdoor selfie! 💙✨ Traditional meets modern with a touch of timeless elegance.",
    hashtags: ["#blue", "#stripes", "#outdoor", "#natural", "#light", "#traditional", "#modern", "#timeless", "#bindi"],
    likes: 4567,
    comments: [
      {
        id: "1",
        username: "outdoor_lover",
        text: "Natural lighting is your best friend! Stunning 💙",
        timeAgo: "7h",
        likes: 35,
        isLiked: false,
      },
      {
        id: "2",
        username: "traditional_beauty",
        text: "Love how you blend traditional and modern so effortlessly! 🌟",
        timeAgo: "6h",
        likes: 41,
        isLiked: true,
      },
    ],
    timeAgo: "12 hours ago",
    isLiked: true,
    isSaved: false,
    category: "outdoor",
    quality: "high",
    dimensions: { width: 1080, height: 1920 },
    fileSize: 2.3,
    alt: "Varsha in blue striped top, outdoor selfie with natural lighting and traditional bindi",
  },
  {
    id: "6",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo6,
    isVerified: true,
    location: "Cozy Corner",
    images: [blobAssets.photos.photo6],
    caption:
      "Cozy hoodie vibes and soft lighting magic! 🤍✨ Sometimes the most comfortable moments create the most genuine smiles and peaceful energy.",
    hashtags: ["#cozy", "#hoodie", "#white", "#soft", "#lighting", "#comfortable", "#genuine", "#peaceful", "#casual"],
    likes: 6789,
    comments: [
      {
        id: "1",
        username: "cozy_vibes",
        text: "This is pure comfort goals! Love the soft aesthetic 🤍",
        timeAgo: "8h",
        likes: 52,
        isLiked: false,
      },
      {
        id: "2",
        username: "peaceful_soul",
        text: "Your genuine smile is everything! So peaceful and beautiful 😊",
        timeAgo: "7h",
        likes: 67,
        isLiked: true,
      },
    ],
    timeAgo: "1 day ago",
    isLiked: true,
    isSaved: true,
    category: "casual",
    quality: "high",
    dimensions: { width: 1080, height: 1920 },
    fileSize: 2.0,
    alt: "Varsha in white hoodie, casual indoor selfie with soft lighting and genuine smile",
  },
]

// Optimized Image Component
const OptimizedImage: React.FC<{
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  priority?: boolean
  quality?: "high" | "medium" | "low"
  sizes?: string
  onClick?: () => void
}> = ({ src, alt, className = "", onLoad, onError, priority = false, quality = "high", sizes, onClick }) => {
  const [loadState, setLoadState] = useState<ImageLoadState>({
    loading: true,
    loaded: false,
    error: false,
    retryCount: 0,
    progress: 0,
  })
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority) return

    const observerOptions = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (observerRef.current) {
            observerRef.current.disconnect()
          }
        }
      })
    }, observerOptions)

    if (imgRef.current && observerRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  const handleLoad = () => {
    setLoadState((prev) => ({
      ...prev,
      loading: false,
      loaded: true,
      error: false,
      progress: 100,
    }))
    onLoad?.()
  }

  const handleError = () => {
    setLoadState((prev) => ({
      ...prev,
      loading: false,
      error: true,
      retryCount: prev.retryCount + 1,
    }))
    onError?.()
  }

  const retryLoad = () => {
    if (loadState.retryCount >= 3) return

    setLoadState((prev) => ({
      ...prev,
      loading: true,
      error: false,
      progress: 0,
    }))

    if (imgRef.current) {
      const currentSrc = imgRef.current.src
      imgRef.current.src = ""
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = currentSrc
        }
      }, 100)
    }
  }

  const shouldShowFallback = loadState.error && loadState.retryCount >= 3

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading State */}
      {loadState.loading && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadState.error && !shouldShowFallback && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <span className="text-xs text-gray-600 mb-2 text-center px-2">Failed to load image</span>
          {loadState.retryCount < 3 && (
            <Button size="sm" variant="outline" onClick={retryLoad} className="text-xs px-2 py-1 h-6 bg-transparent">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry ({loadState.retryCount}/3)
            </Button>
          )}
        </div>
      )}

      {/* Placeholder for lazy loading */}
      {!isInView && !priority && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
          <ImageIcon className="h-12 w-12 text-purple-300" />
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          src={shouldShowFallback ? "/placeholder.svg" : src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 cursor-pointer hover:scale-105 ${
            loadState.loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          crossOrigin="anonymous"
          loading={priority ? "eager" : "lazy"}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        />
      )}

      {/* Quality Indicator */}
      {loadState.loaded && !shouldShowFallback && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Wifi className="h-2 w-2" />
          {quality?.toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default function PhotoGallery() {
  // Core state
  const [posts, setPosts] = useState<InstagramPost[]>(instagramPosts)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({})

  // UI state
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Settings
  const itemsPerPage = 6

  const { toast } = useToast()

  // Categories for filtering
  const categories = useMemo(() => {
    const cats = ["all", ...new Set(posts.map((post) => post.category))]
    return cats
  }, [posts])

  // Filtered and paginated posts
  const filteredPosts = useMemo(() => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.hashtags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          post.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    return filtered
  }, [posts, searchQuery, selectedCategory])

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPosts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPosts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)

  // Format numbers (Instagram style)
  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  // Handle like toggle
  const toggleLike = useCallback(
    (postId: string) => {
      setLikedPosts((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(postId)) {
          newSet.delete(postId)
        } else {
          newSet.add(postId)
        }
        return newSet
      })

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newIsLiked = !likedPosts.has(postId)
            return {
              ...post,
              likes: newIsLiked ? post.likes + 1 : post.likes - 1,
              isLiked: newIsLiked,
            }
          }
          return post
        }),
      )

      // Heart animation effect
      if (!likedPosts.has(postId)) {
        createHeartAnimation()
      }
    },
    [likedPosts],
  )

  // Handle save toggle
  const toggleSave = useCallback(
    (postId: string) => {
      setSavedPosts((prev) => {
        const newSet = new Set(prev)
        const wasSaved = newSet.has(postId)

        if (wasSaved) {
          newSet.delete(postId)
        } else {
          newSet.add(postId)
        }

        toast({
          title: wasSaved ? "Removed from saved" : "Saved!",
          description: wasSaved ? "Photo removed from collection" : "Photo saved to collection 📌",
        })

        return newSet
      })
    },
    [toast],
  )

  // Create heart animation
  const createHeartAnimation = () => {
    const heart = document.createElement("div")
    heart.innerHTML = "❤️"
    heart.className = "fixed text-6xl pointer-events-none z-50 animate-ping"
    heart.style.left = "50%"
    heart.style.top = "50%"
    heart.style.transform = "translate(-50%, -50%)"
    document.body.appendChild(heart)

    setTimeout(() => {
      if (document.body.contains(heart)) {
        document.body.removeChild(heart)
      }
    }, 1000)
  }

  // Handle double click to like
  const handleDoubleClick = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (post && !likedPosts.has(postId)) {
      toggleLike(postId)
    }
  }

  // Handle share
  const handleShare = async (post: InstagramPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${post.username}'s photo`,
          text: post.caption,
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
          description: "Photo link copied to clipboard 📋",
        })
      } catch (error) {
        toast({
          title: "Share",
          description: "Unable to share at this time",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white">
      {/* Gallery Header with Controls */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Varsha's Gallery
              </h2>
              <p className="text-sm text-gray-600">
                {filteredPosts.length} photos • {categories.length - 1} categories
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search photos, captions, or hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Photos" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="p-4">
        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No photos found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Instagram-style Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => {
            const currentIndex = currentImageIndex[post.id] || 0

            return (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <OptimizedImage
                      src={post.userAvatar}
                      alt={post.username}
                      className="w-8 h-8 rounded-full"
                      priority={true}
                    />
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{post.username}</span>
                      {post.isVerified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {post.location && <span className="text-xs text-gray-500">• {post.location}</span>}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Container */}
                <div className="relative aspect-square bg-gray-100">
                  <OptimizedImage
                    src={post.images[currentIndex]}
                    alt={post.alt}
                    className="w-full h-full"
                    priority={false}
                    quality={post.quality}
                    onClick={() => setSelectedPost(post)}
                    onDoubleClick={() => handleDoubleClick(post.id)}
                  />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium capitalize">
                    {post.category}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1 transition-colors hover:text-red-500"
                      >
                        <Heart
                          className={`w-6 h-6 transition-colors ${
                            likedPosts.has(post.id) ? "text-red-500 fill-red-500" : "text-gray-600"
                          }`}
                        />
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors">
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleShare(post)}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                    <button onClick={() => toggleSave(post.id)} className="transition-colors hover:text-yellow-500">
                      <Bookmark
                        className={`w-6 h-6 ${
                          savedPosts.has(post.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Likes Count */}
                  <div className="mb-2">
                    <span className="font-semibold text-sm">
                      {formatCount((post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0))} likes
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="mb-2">
                    <span className="font-semibold text-sm mr-2">{post.username}</span>
                    <span className="text-sm">{post.caption}</span>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.hashtags.slice(0, 3).map((hashtag, index) => (
                      <span key={index} className="text-xs text-blue-600 hover:underline cursor-pointer">
                        {hashtag}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className="text-xs text-gray-500">+{post.hashtags.length - 3} more</span>
                    )}
                  </div>

                  {/* Comments Preview */}
                  {post.comments.length > 0 && (
                    <div className="space-y-1 mb-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        View all {post.comments.length} comments
                      </button>
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <span className="font-semibold mr-2">{comment.username}</span>
                          <span>{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Time */}
                  <div className="text-xs text-gray-500 uppercase">{post.timeAgo}</div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent
          className={`max-w-7xl p-0 overflow-hidden bg-black ${isFullscreen ? "w-screen h-screen max-w-none" : ""}`}
        >
          {selectedPost && (
            <div className={`flex ${isFullscreen ? "h-screen" : "h-[90vh]"}`}>
              {/* Image Section */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <OptimizedImage
                  src={selectedPost.images[currentImageIndex[selectedPost.id] || 0]}
                  alt={selectedPost.alt}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  priority={true}
                  style={{
                    transform: `scale(${zoomLevel})`,
                  }}
                />

                {/* Top Controls */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedPost.images.length > 1 && (
                      <div className="bg-black/60 rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium">
                          {(currentImageIndex[selectedPost.id] || 0) + 1}/{selectedPost.images.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-black/60 rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                        disabled={zoomLevel <= 0.5}
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 5))}
                        disabled={zoomLevel >= 5}
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Fullscreen Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80"
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>

                    {/* Close Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPost(null)}
                      className="h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              {!isFullscreen && (
                <div className="w-80 bg-white flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <OptimizedImage
                        src={selectedPost.userAvatar}
                        alt={selectedPost.username}
                        className="w-8 h-8 rounded-full"
                        priority={true}
                      />
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-sm">{selectedPost.username}</span>
                          {selectedPost.isVerified && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        {selectedPost.location && (
                          <span className="text-xs text-gray-500">{selectedPost.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Caption */}
                    <div className="text-sm">
                      <span className="font-semibold mr-2">{selectedPost.username}</span>
                      <span>{selectedPost.caption}</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedPost.hashtags.map((hashtag, index) => (
                          <span key={index} className="text-blue-600 hover:underline cursor-pointer">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-3">Comments</h4>
                      {selectedPost.comments.map((comment) => (
                        <div key={comment.id} className="text-sm mb-3">
                          <span className="font-semibold mr-2">{comment.username}</span>
                          <span>{comment.text}</span>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>{comment.timeAgo}</span>
                            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                              <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                              <span>{formatCount(comment.likes)}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(selectedPost.id)}
                          className="flex items-center gap-1 transition-colors hover:text-red-500"
                        >
                          <Heart
                            className={`w-6 h-6 transition-colors ${
                              likedPosts.has(selectedPost.id) ? "text-red-500 fill-red-500" : "text-gray-600"
                            }`}
                          />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
                          <MessageCircle className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleShare(selectedPost)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleSave(selectedPost.id)}
                        className="transition-colors hover:text-yellow-500"
                      >
                        <Bookmark
                          className={`w-6 h-6 ${
                            savedPosts.has(selectedPost.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mb-2">
                      <span className="font-semibold text-sm">
                        {formatCount((selectedPost.likes || 0) + (likedPosts.has(selectedPost.id) ? 1 : 0))} likes
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 uppercase">{selectedPost.timeAgo}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
