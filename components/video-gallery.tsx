"use client"

import { useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  videoUrl: string
}

const videoData: Video[] = [
  {
    id: "1",
    title: "Birthday Celebration 2023",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Birthday+Celebration",
    duration: "2:45",
    videoUrl: "/placeholder.svg?height=400&width=600&text=Video+Player",
  },
  {
    id: "2",
    title: "Fun with Friends",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Friends+Fun",
    duration: "1:30",
    videoUrl: "/placeholder.svg?height=400&width=600&text=Video+Player",
  },
  {
    id: "3",
    title: "Travel Adventures",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Travel+Adventures",
    duration: "3:20",
    videoUrl: "/placeholder.svg?height=400&width=600&text=Video+Player",
  },
  {
    id: "4",
    title: "Family Moments",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Family+Moments",
    duration: "2:15",
    videoUrl: "/placeholder.svg?height=400&width=600&text=Video+Player",
  },
  {
    id: "5",
    title: "Dance Performance",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Dance+Performance",
    duration: "4:10",
    videoUrl: "/placeholder.svg?height=400&width=600&text=Video+Player",
  },
  {
    id: "6",
    title: "Graduation Day",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Graduation+Day",
    duration: "5:30",
    videoUrl: "/placeholder.svg?height=400&width=600&text=Video+Player",
  },
]

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([75])
  const [currentTime, setCurrentTime] = useState([0])
  const [duration, setDuration] = useState(100)

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setIsPlaying(false)
    setCurrentTime([0])
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
  }

  const skipForward = () => {
    const newTime = Math.min(currentTime[0] + 10, duration)
    setCurrentTime([newTime])
  }

  const skipBackward = () => {
    const newTime = Math.max(currentTime[0] - 10, 0)
    setCurrentTime([newTime])
  }

  const restartVideo = () => {
    setCurrentTime([0])
    setIsPlaying(true)
  }

  const goToNextVideo = () => {
    if (!selectedVideo) return
    const currentIndex = videoData.findIndex((v) => v.id === selectedVideo.id)
    const nextIndex = (currentIndex + 1) % videoData.length
    handleVideoSelect(videoData[nextIndex])
  }

  const goToPreviousVideo = () => {
    if (!selectedVideo) return
    const currentIndex = videoData.findIndex((v) => v.id === selectedVideo.id)
    const prevIndex = (currentIndex - 1 + videoData.length) % videoData.length
    handleVideoSelect(videoData[prevIndex])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {selectedVideo && (
        <Card className="border-2 border-pink-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative bg-black aspect-video">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">{selectedVideo.title}</div>
                  <div className="text-lg opacity-80">Video Player Placeholder</div>
                  <div className="text-sm opacity-60 mt-2">Duration: {selectedVideo.duration}</div>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="bg-gray-900 text-white p-4 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider value={currentTime} onValueChange={handleSeek} max={duration} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime[0])}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousVideo}
                    className="text-white hover:bg-gray-700"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={skipBackward} className="text-white hover:bg-gray-700">
                    <RotateCcw className="h-4 w-4" />
                    <span className="ml-1 text-xs">10s</span>
                  </Button>

                  <Button variant="ghost" size="sm" onClick={togglePlayPause} className="text-white hover:bg-gray-700">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={restartVideo} className="text-white hover:bg-gray-700">
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={skipForward} className="text-white hover:bg-gray-700">
                    <span className="mr-1 text-xs">10s</span>
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={goToNextVideo} className="text-white hover:bg-gray-700">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-gray-700">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <div className="w-20">
                    <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
                  </div>

                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold">{selectedVideo.title}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoData.map((video) => (
          <Card
            key={video.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
              selectedVideo?.id === video.id ? "border-pink-400 shadow-lg" : "border-pink-200 hover:border-pink-300"
            }`}
            onClick={() => handleVideoSelect(video)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videoData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No videos available.</p>
        </div>
      )}
    </div>
  )
}
