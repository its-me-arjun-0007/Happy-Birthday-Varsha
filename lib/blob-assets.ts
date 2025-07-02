// Centralized blob asset management for Varsha's birthday site
// This file manages all blob URLs for images, videos, and other assets

export const blobAssets = {
  // Photo gallery images - Updated with new beautiful photos
  photos: {
    photo1:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20250428_100216_373.jpg-ZfGmYZUwzvETySSVPkpSOTPusk7u3K.jpeg", // Coral floral top, thoughtful pose
    photo2:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_vrshha.jpg__-20250217-0001.jpg-oT0Wi1abRYXLLCdRcDoxCBVqDnwx9M.jpeg", // Mint green t-shirt, natural selfie
    photo3:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20250504_114953_865.jpg-3IuZOf0waI9R7qPDX0dnBsAfeGXVIK.jpeg", // White patterned shirt, cafe setting
    photo4:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20250620_195952_994.jpg-QsB8ZsY8AU47x88IsZOpJLLvh9pkwq.jpeg", // Purple t-shirt, playful pose
    photo5:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20250428_100213_683.jpg-lIxJdzzegzaiZQCTwhYQZX912knTGQ.jpeg", // Blue striped top, outdoor selfie
    photo6:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_vrshha.jpg__-20250224-0001.jpg-2YuZu8FXhIORwx035JIvfcbMRyadVG.jpeg", // White hoodie, casual indoor selfie
  },

  // Video thumbnails (Varsha's photos)
  videoThumbnails: {
    // thumb1: "/thumbnails/thumb-1.jpg", // Blue striped top selfie
    // thumb2: "/thumbnails/thumb-2.jpg", // Purple top with playful gesture
    // thumb3: "/thumbnails/thumb-3.jpg", // White patterned shirt at cafe
    // thumb4: "/thumbnails/thumb-4.jpg", // Traditional blue saree in garden
    // thumb5: "/thumbnails/thumb-5.jpg", // Artistic green top mood shot
    // thumb6: "/thumbnails/thumb-6.jpg", // Bright smile in graphic tee
  },

  // Video files
  videos: {
    video1:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_vrshha.__-20250516-0001-ZTtuiD87h1Kv9JNaAGqwhkL3mhknut.mp4", // Updated with new video
    video2:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smiley_y_y._-20240928-0001-y0gKucvKJppsmN6ZRdJsJkVSnYoB4I.mp4", // Updated with new smiley video
    video3:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_vrshha.__-20250515-0001-EWBYJgPQsH0sFW3HocolOdqZaLEcvk.mp4", // Updated with new Vrshha video
    video4:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lv_7225387540260424966_20230704100014-cSaNfCALrxE5fiI6ATnvjNeG2vPavD.mp4", // Updated with new video
    video5:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smiley_y_y._-20240713-0002-gkPua0xjNknRQQFtMzPSMN3hpKzkO7.mp4", // Updated with the new smiley video
    video6:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/smiley_y_y._-20240922-0001-0jSK0R9A53USB1XiIURIqzQpgAcqnZ.mp4", // NEW: Updated with the latest smiley video (September 2024)
  },

  // Music files
  music: {
    song1: {
      audio: "https://files.catbox.moe/u9twdd.mp3",
      cover: "https://files.catbox.moe/3m0neu.jpg",
    },
    song2: {
      audio: "https://files.catbox.moe/bbo9ig.mp3",
      cover: "https://files.catbox.moe/wne5n9.jpg",
    },
    song3: {
      audio: "https://files.catbox.moe/4dxt66.mp3",
      cover: "https://files.catbox.moe/0ja0i5.jpg",
    },
    song4: {
      audio: "https://files.catbox.moe/h8djbg.mp3",
      cover: "https://files.catbox.moe/nvrvne.jpg",
    },
  },

  // Decorative elements
  decorations: {
    balloon1: "https://files.catbox.moe/yi8hi2.png",
    balloon2: "https://files.catbox.moe/a9bl7d.png",
  },

  // Hero video for front page
  heroVideo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1751459234086-HIDnbNCDb1xu7THb4xMRBOJZUmkL5V.mp4",
} as const

// Helper function to get blob URL with fallback
export function getBlobUrl(category: keyof typeof blobAssets, key: string, fallback?: string): string {
  const categoryAssets = blobAssets[category] as Record<string, any>
  return categoryAssets?.[key] || fallback || "/placeholder.svg"
}

// Type-safe asset getters
export const getPhotoUrl = (photoKey: keyof typeof blobAssets.photos) => blobAssets.photos[photoKey]

export const getVideoThumbnailUrl = (thumbKey: keyof typeof blobAssets.videoThumbnails) =>
  blobAssets.videoThumbnails[thumbKey]

export const getVideoUrl = (videoKey: keyof typeof blobAssets.videos) => blobAssets.videos[videoKey]

export const getMusicUrl = (songKey: keyof typeof blobAssets.music) => blobAssets.music[songKey]

export const getDecorationUrl = (decorKey: keyof typeof blobAssets.decorations) => blobAssets.decorations[decorKey]

export const getHeroVideoUrl = () => blobAssets.heroVideo
