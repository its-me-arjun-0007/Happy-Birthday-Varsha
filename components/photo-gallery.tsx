"use client"
import { useState } from "react"
import { Heart, MessageCircle, Send, Bookmark, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * One small responsive tile that shows its own loading
 * spinner and an error placeholder (with a local fallback image)
 */
function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const fallback = "/placeholder.jpg"
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const currentSrc = status === "error" ? fallback : src

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
      {status === "loading" && (
        <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-muted-foreground" />
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-background/60 backdrop-blur">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <span className="text-xs text-muted-foreground">Failed&nbsp;to&nbsp;load</span>
        </div>
      )}

      <img
        src={currentSrc || "/placeholder.svg"}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          status === "loading" ? "opacity-0" : "opacity-100",
        )}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
        crossOrigin="anonymous"
      />
    </div>
  )
}

/**
 * Dummy Instagram-style data – replace with real URLs as needed.
 * (Feel free to inject your own array of URLs via the `images` prop.)
 */
const demoUrls = [
  "/thumbnails/thumb-1.jpg",
  "/thumbnails/thumb-2.jpg",
  "/thumbnails/thumb-3.jpg",
  "/thumbnails/thumb-4.jpg",
  "/thumbnails/thumb-5.jpg",
  "/thumbnails/thumb-6.jpg",
]

type PhotoGalleryProps = {
  images?: string[]
  className?: string
}

export default function PhotoGallery({ images = demoUrls, className }: PhotoGalleryProps) {
  return (
    <section
      className={cn(
        "mx-auto grid max-w-5xl grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        className,
      )}
    >
      {images.map((url, idx) => (
        <GalleryImage key={idx} src={url} alt={`Photo ${idx + 1}`} />
      ))}

      {/* Lightweight action buttons just for demo purposes */}
      <div className="col-span-full mt-6 flex justify-center gap-6 text-muted-foreground">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Send className="h-5 w-5" />
        <Bookmark className="h-5 w-5" />
      </div>
    </section>
  )
}
