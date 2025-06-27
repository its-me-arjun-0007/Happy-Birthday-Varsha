"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { blobAssets } from "@/lib/blob-assets"

// Sample photos - using centralized blob assets
const PHOTOS = [
  {
    id: 1,
    src: blobAssets.photos.photo1,
    alt: "Varsha's beautiful moment",
    caption: "❤️",
  },
  {
    id: 2,
    src: blobAssets.photos.photo2,
    alt: "Varsha's sweet smile",
    caption: "❤️",
  },
  {
    id: 3,
    src: blobAssets.photos.photo3,
    alt: "Varsha's lovely photo",
    caption: "❤️",
  },
  {
    id: 4,
    src: blobAssets.photos.photo4,
    alt: "Varsha's gorgeous picture",
    caption: "❤️",
  },
  {
    id: 5,
    src: blobAssets.photos.photo5,
    alt: "Varsha's wonderful moment",
    caption: "❤️",
  },
  {
    id: 6,
    src: blobAssets.photos.photo6,
    alt: "Varsha's amazing photo",
    caption: "❤️",
  },
]

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof PHOTOS)[0] | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {PHOTOS.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.src || "/placeholder.svg"}
              alt={photo.alt}
              fill
              className="object-cover transition-transform group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={photo.id <= 3} // Prioritize first 3 images
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
              <p className="text-white text-sm font-medium text-center">{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>

          {selectedPhoto && (
            <div className="relative">
              <div className="relative h-[70vh] w-full">
                <Image
                  src={selectedPhoto.src || "/placeholder.svg"}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-center">
                <p className="text-white text-lg">{selectedPhoto.caption}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
