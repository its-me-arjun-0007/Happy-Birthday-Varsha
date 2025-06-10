"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

// Sample photos - in a real app, these would be actual photos of Varsha
const PHOTOS = [
  {
    id: 1,
    src: "/placeholder.svg?height=400&width=600",
    alt: "Varsha at her previous birthday",
    caption: "Last year's celebration",
  },
  {
    id: 2,
    src: "/placeholder.svg?height=400&width=600",
    alt: "Varsha with friends",
    caption: "Fun times with friends",
  },
  {
    id: 3,
    src: "/placeholder.svg?height=400&width=600",
    alt: "Varsha at a party",
    caption: "Party memories",
  },
  {
    id: 4,
    src: "/placeholder.svg?height=400&width=600",
    alt: "Varsha traveling",
    caption: "Adventure time",
  },
  {
    id: 5,
    src: "/placeholder.svg?height=400&width=600",
    alt: "Varsha at graduation",
    caption: "Proud moments",
  },
  {
    id: 6,
    src: "/placeholder.svg?height=400&width=600",
    alt: "Varsha with family",
    caption: "Family love",
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
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-white text-sm font-medium">{photo.caption}</p>
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
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                <p className="text-white text-lg">{selectedPhoto.caption}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
