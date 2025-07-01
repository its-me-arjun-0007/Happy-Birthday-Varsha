"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
}

interface Comment {
  id: string
  username: string
  text: string
  timeAgo: string
  likes: number
  isLiked: boolean
}

// Enhanced photo data with Instagram-style metadata and multiple images per post
const instagramPosts: InstagramPost[] = [
  {
    id: "1",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo1,
    isVerified: true,
    location: "Home Sweet Home",
    images: [blobAssets.photos.photo1, blobAssets.photos.photo2, blobAssets.photos.photo3],
    caption: "Living my best life! ✨ Every moment is a blessing and I'm grateful for all the love and support.",
    hashtags: ["#blessed", "#grateful", "#livingmybestlife", "#positivevibes"],
    likes: 2847,
    comments: [
      {
        id: "1",
        username: "bestfriend_sara",
        text: "You look absolutely stunning! 😍",
        timeAgo: "2h",
        likes: 12,
        isLiked: false,
      },
      { id: "2", username: "mom_love", text: "My beautiful daughter ❤️", timeAgo: "1h", likes: 25, isLiked: true },
    ],
    timeAgo: "3 hours ago",
    isLiked: false,
    isSaved: false,
  },
  {
    id: "2",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo4,
    isVerified: true,
    location: "Home Sweet Home",
    images: [blobAssets.photos.photo4, blobAssets.photos.photo5],
    caption: "Traditional vibes in the most beautiful setting! 🌺 Heritage fashion never goes out of style!",
    hashtags: ["#traditional", "#saree", "#culture", "#heritage", "#royal"],
    likes: 4156,
    comments: [
      { id: "1", username: "fashion_guru", text: "Absolutely regal! 👑", timeAgo: "6h", likes: 31, isLiked: false },
      {
        id: "2",
        username: "grandma_love",
        text: "You look like a princess! 🌺",
        timeAgo: "5h",
        likes: 45,
        isLiked: true,
      },
    ],
    timeAgo: "12 hours ago",
    isLiked: true,
    isSaved: true,
  },
  {
    id: "3",
    username: "varsha_official",
    userAvatar: blobAssets.photos.photo6,
    isVerified: true,
    location: "Home Sweet Home",
    images: [blobAssets.photos.photo6],
    caption: "Casual vibes, genuine smiles! 😊 Sometimes the best moments happen when you're just being yourself.",
    hashtags: ["#casual", "#genuine", "#home", "#comfort", "#authentic"],
    likes: 3892,
    comments: [
      {
        id: "1",
        username: "roommate_bestie",
        text: "Home is where the heart is! 🏠❤️",
        timeAgo: "2d",
        likes: 19,
        isLiked: false,
      },
      { id: "2", username: "family_love", text: "Natural beauty! 😍", timeAgo: "1d", likes: 33, isLiked: true },
    ],
    timeAgo: "2 days ago",
    isLiked: true,
    isSaved: false,
  },
]

export default function PhotoGallery() {
  const [posts, setPosts] = useState<InstagramPost[]>(instagramPosts)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({})
  const [showAllComments, setShowAllComments] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const { toast } = useToast()

  // Format numbers (Instagram style)
  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  // Handle like toggle
  const toggleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1,
          }
        }
        return post
      }),
    )

    // Heart animation effect
    if (!posts.find((p) => p.id === postId)?.isLiked) {
      createHeartAnimation()
    }
  }

  // Handle save toggle
  const toggleSave = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return { ...post, isSaved: !post.isSaved }
        }
        return post
      }),
    )

    const post = posts.find((p) => p.id === postId)
    if (post) {
      toast({
        title: post.isSaved ? "Removed from saved" : "Saved!",
        description: post.isSaved ? "Post removed from collection" : "Post saved to collection 📌",
      })
    }
  }

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

  // Handle carousel navigation
  const navigateCarousel = (postId: string, direction: "prev" | "next") => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const currentIndex = currentImageIndex[postId] || 0
    let newIndex: number

    if (direction === "next") {
      newIndex = currentIndex < post.images.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : post.images.length - 1
    }

    setCurrentImageIndex((prev) => ({ ...prev, [postId]: newIndex }))

    // Scroll to the new image
    const carousel = carouselRefs.current[postId]
    if (carousel) {
      const imageWidth = carousel.offsetWidth
      carousel.scrollTo({
        left: newIndex * imageWidth,
        behavior: "smooth",
      })
    }
  }

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (postId: string) => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      navigateCarousel(postId, "next")
    } else if (isRightSwipe) {
      navigateCarousel(postId, "prev")
    }
  }

  // Handle double tap to like
  const handleDoubleClick = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (post && !post.isLiked) {
      toggleLike(postId)
    }
  }

  // Handle share
  const handleShare = async (post: InstagramPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${post.username}'s post`,
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
          description: "Post link copied to clipboard 📋",
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
    <div className="w-full max-w-lg mx-auto bg-white">
      {/* Instagram Feed */}
      <div className="divide-y divide-gray-200">
        {posts.map((post) => {
          const currentIndex = currentImageIndex[post.id] || 0
          const hasMultipleImages = post.images.length > 1

          return (
            <article key={post.id} className="bg-white">
              {/* Post Header */}
              <header className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={post.userAvatar || "/placeholder.svg"}
                      alt={post.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 -z-10">
                      <div className="w-full h-full rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-sm text-gray-900">{post.username}</span>
                      {post.isVerified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {post.location && <span className="text-xs text-gray-500">{post.location}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </Button>
              </header>

              {/* Post Images Carousel */}
              <div className="relative">
                <div
                  ref={(el) => {
                    carouselRefs.current[post.id] = el
                  }}
                  className="flex overflow-x-hidden scroll-smooth"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(post.id)}
                >
                  {post.images.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0 aspect-square bg-gray-100">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer select-none"
                        onDoubleClick={() => handleDoubleClick(post.id)}
                        onClick={() => setSelectedPost(post)}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation Buttons */}
                {hasMultipleImages && (
                  <>
                    {currentIndex > 0 && (
                      <button
                        onClick={() => navigateCarousel(post.id, "prev")}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                    )}

                    {currentIndex < post.images.length - 1 && (
                      <button
                        onClick={() => navigateCarousel(post.id, "next")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </>
                )}

                {/* Image Indicators */}
                {hasMultipleImages && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {post.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentIndex ? "bg-blue-500" : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Multiple Images Indicator */}
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3 bg-black/50 rounded-full px-2 py-1">
                    <span className="text-white text-xs font-medium">
                      {currentIndex + 1}/{post.images.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors duration-200 ${
                        post.isLiked ? "text-red-500 fill-red-500" : "text-gray-900 hover:text-gray-600"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setShowAllComments(showAllComments === post.id ? null : post.id)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <MessageCircle className="w-6 h-6 text-gray-900 hover:text-gray-600 transition-colors duration-200" />
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Send className="w-6 h-6 text-gray-900 hover:text-gray-600 transition-colors duration-200" />
                  </button>
                </div>
                <button
                  onClick={() => toggleSave(post.id)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Bookmark
                    className={`w-6 h-6 transition-colors duration-200 ${
                      post.isSaved ? "text-gray-900 fill-gray-900" : "text-gray-900 hover:text-gray-600"
                    }`}
                  />
                </button>
              </div>

              {/* Likes Count */}
              <div className="px-3 pb-1">
                <button className="font-semibold text-sm text-gray-900 hover:text-gray-600">
                  {formatCount(post.likes)} likes
                </button>
              </div>

              {/* Caption */}
              <div className="px-3 pb-2">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900 mr-2">{post.username}</span>
                  <span className="text-gray-900">{post.caption}</span>
                </div>
                {post.hashtags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.hashtags.map((hashtag, index) => (
                      <button key={index} className="text-sm text-blue-600 hover:underline">
                        {hashtag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="px-3 pb-2">
                  {post.comments.length > 2 && showAllComments !== post.id && (
                    <button
                      onClick={() => setShowAllComments(post.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 mb-2 block"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}

                  <div className="space-y-1">
                    {(showAllComments === post.id ? post.comments : post.comments.slice(0, 2)).map((comment) => (
                      <div key={comment.id} className="flex items-start justify-between group">
                        <div className="text-sm flex-1">
                          <span className="font-semibold text-gray-900 mr-2">{comment.username}</span>
                          <span className="text-gray-900">{comment.text}</span>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>{comment.timeAgo}</span>
                            {comment.likes > 0 && <span>{comment.likes} likes</span>}
                            <button className="hover:text-gray-700">Reply</button>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                          <Heart
                            className={`w-3 h-3 ${comment.isLiked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {showAllComments === post.id && (
                    <button
                      onClick={() => setShowAllComments(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                    >
                      Hide comments
                    </button>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="px-3 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{post.timeAgo}</span>
              </div>

              {/* Add Comment Section */}
              <div className="border-t border-gray-200 px-3 py-3">
                <div className="flex items-center space-x-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 text-sm placeholder-gray-500 border-none outline-none bg-transparent"
                  />
                  <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:text-gray-400">
                    Post
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Full Screen Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black">
          {selectedPost && (
            <div className="flex h-[90vh]">
              {/* Image Section */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <img
                  src={selectedPost.images[currentImageIndex[selectedPost.id] || 0] || "/placeholder.svg"}
                  alt="Full size post"
                  className="max-w-full max-h-full object-contain"
                />

                {/* Modal Navigation */}
                {selectedPost.images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateCarousel(selectedPost.id, "prev")}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => navigateCarousel(selectedPost.id, "next")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Info Section */}
              <div className="w-80 bg-white flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedPost.userAvatar || "/placeholder.svg"}
                      alt={selectedPost.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-sm">{selectedPost.username}</span>
                        {selectedPost.isVerified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {selectedPost.location && <span className="text-xs text-gray-500">{selectedPost.location}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>

                {/* Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-sm">
                    <span className="font-semibold mr-2">{selectedPost.username}</span>
                    <span>{selectedPost.caption}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedPost.hashtags.map((hashtag, index) => (
                        <span key={index} className="text-blue-600">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <span className="font-semibold mr-2">{comment.username}</span>
                      <span>{comment.text}</span>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span>{comment.timeAgo}</span>
                        {comment.likes > 0 && <span>{comment.likes} likes</span>}
                        <button>Reply</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="border-t p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => toggleLike(selectedPost.id)}>
                        <Heart
                          className={`w-6 h-6 ${selectedPost.isLiked ? "text-red-500 fill-red-500" : "text-gray-900"}`}
                        />
                      </button>
                      <button>
                        <MessageCircle className="w-6 h-6 text-gray-900" />
                      </button>
                      <button onClick={() => handleShare(selectedPost)}>
                        <Send className="w-6 h-6 text-gray-900" />
                      </button>
                    </div>
                    <button onClick={() => toggleSave(selectedPost.id)}>
                      <Bookmark
                        className={`w-6 h-6 ${selectedPost.isSaved ? "text-gray-900 fill-gray-900" : "text-gray-900"}`}
                      />
                    </button>
                  </div>

                  <div className="font-semibold text-sm">{formatCount(selectedPost.likes)} likes</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{selectedPost.timeAgo}</div>

                  <div className="flex items-center space-x-3 pt-2 border-t">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 text-sm placeholder-gray-500 border-none outline-none"
                    />
                    <button className="text-sm font-semibold text-blue-500">Post</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Styles */}
      <style jsx>{`
        /* Smooth scrolling for carousel */
        .scroll-smooth {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar */
        .overflow-x-hidden::-webkit-scrollbar {
          display: none;
        }

        /* Instagram-style animations */
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .animate-heart {
          animation: heartPulse 0.3s ease-in-out;
        }

        /* Smooth transitions */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.95);
          }
        }

        /* Focus states */
        button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}
