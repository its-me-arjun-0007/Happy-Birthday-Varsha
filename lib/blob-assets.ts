// Centralized blob asset management for Varsha's birthday site
// This file manages all blob URLs for images, videos, and other assets

export const blobAssets = {
  // Photo gallery images
  photos: {
    photo1: "https://files.catbox.moe/nnqroj.jpg",
    photo2: "https://files.catbox.moe/wa1vpn.jpg",
    photo3: "https://files.catbox.moe/450wcf.jpg",
    photo4: "https://files.catbox.moe/fy9eg2.jpg",
    photo5: "https://files.catbox.moe/ubbyew.jpg",
    photo6: "https://files.catbox.moe/gxs8xu.jpg",
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
    video1: "https://files.catbox.moe/nl70vd.mp4",
    video2: "https://files.catbox.moe/zggvr5.mp4",
    video3: "https://files.catbox.moe/k4zk03.mp4",
    video4: "https://files.catbox.moe/eapza2.mp4",
    video5: "https://files.catbox.moe/n216d9.mp4",
    video6: "https://files.catbox.moe/072kf9.mp4",
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
  heroVideo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1751030597793-cqGDMbETKlv9KYgNAqeuUtWcQZQTbQ.mp4",
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
