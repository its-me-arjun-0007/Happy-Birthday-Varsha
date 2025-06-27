"use client"

import Image from "next/image"
import { Cake, Gift, Music, Play, Heart, Sparkles, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Confetti from "@/components/confetti"
import CountdownTimer from "@/components/countdown-timer"
import MusicPlayer from "@/components/music-player"
import PhotoGallery from "@/components/photo-gallery"
import VideoGallery from "@/components/video-gallery"
import { config } from "@/lib/config"
import { blobAssets } from "@/lib/blob-assets"

export default function ClientComponent() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 overflow-hidden">
      <Confetti />

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-pink-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Floating decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-8 left-8 opacity-80 animate-bounce delay-300">
              <Image
                src={blobAssets.decorations.balloon1 || "/placeholder.svg"}
                alt="Balloon decoration"
                width={118}
                height={118}
                className="drop-shadow-lg"
              />
            </div>
            <div className="absolute top-8 right-8 opacity-80 animate-bounce delay-300">
              <Image
                src={blobAssets.decorations.balloon2 || "/placeholder.svg"}
                alt="Balloon decoration"
                width={120}
                height={120}
                className="drop-shadow-lg"
              />
            </div>

            {/* Floating hearts */}
            <div className="absolute top-32 left-1/4 animate-float">
              <Heart className="h-6 w-6 text-pink-400 fill-pink-400 opacity-60" />
            </div>
            <div className="absolute top-48 right-1/3 animate-float delay-1000">
              <Sparkles className="h-5 w-5 text-purple-400 opacity-70" />
            </div>
            <div className="absolute top-40 left-2/3 animate-float delay-2000">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 opacity-60" />
            </div>
          </div>

          <div className="text-center relative z-10 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent leading-tight">
                Happy Birthday
              </h1>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-pink-600 animate-pulse">Varsha! 🎉</h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
                Welcome to Varsha's magical birthday celebration!
              </p>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center justify-center space-x-2 pt-4">
              <div className="h-1 w-8 bg-gradient-to-r from-pink-400 to-transparent rounded-full"></div>
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              <div className="h-1 w-16 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full"></div>
              <Heart className="h-4 w-4 text-purple-500 fill-purple-500" />
              <div className="h-1 w-8 bg-gradient-to-l from-indigo-400 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="relative px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/30 to-indigo-100/50"></div>
            <CardContent className="relative pt-8 pb-8 px-6 sm:px-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center space-x-3 mb-4">
                  <Cake className="h-8 w-8 text-pink-500" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Countdown to the Big Day
                  </h2>
                  <Cake className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-gray-600 text-lg">Every second brings us closer to the celebration!</p>
              </div>
              <CountdownTimer targetDate={config.birthdayDate} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="relative px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="gallery" className="space-y-8">
            {/* Enhanced Tab Navigation */}
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 bg-white/80 backdrop-blur-md border-0 shadow-xl rounded-2xl p-2 h-auto">
                <TabsTrigger
                  value="gallery"
                  className="flex items-center space-x-2 px-6 py-4 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Gift className="h-5 w-5" />
                  <span className="hidden sm:inline">Photo Gallery</span>
                  <span className="sm:hidden">Photos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="flex items-center space-x-2 px-6 py-4 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Play className="h-5 w-5" />
                  <span className="hidden sm:inline">Video Gallery</span>
                  <span className="sm:hidden">Videos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="music"
                  className="flex items-center space-x-2 px-6 py-4 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Music className="h-5 w-5" />
                  <span className="hidden sm:inline">Birthday Playlist</span>
                  <span className="sm:hidden">Music</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="gallery" className="mt-0">
              <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-white/50 to-purple-50/80"></div>
                <CardContent className="relative pt-8 pb-8 px-6 sm:px-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center space-x-3 mb-4">
                      <Gift className="h-7 w-7 text-pink-500" />
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Princess
                      </h2>
                      <Gift className="h-7 w-7 text-purple-500" />
                    </div>
                    <p className="text-gray-600 text-lg">A collection of beautiful photos</p>
                  </div>
                  <PhotoGallery />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="mt-0">
              <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-indigo-50/80"></div>
                <CardContent className="relative pt-8 pb-8 px-6 sm:px-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center space-x-3 mb-4">
                      <Play className="h-7 w-7 text-purple-500" />
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Videos
                      </h2>
                      <Play className="h-7 w-7 text-indigo-500" />
                    </div>
                    <p className="text-gray-600 text-lg">Special moments through moving pictures</p>
                  </div>
                  <VideoGallery />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="music" className="mt-0">
              <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/50 to-pink-50/80"></div>
                <CardContent className="relative pt-8 pb-8 px-6 sm:px-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center space-x-3 mb-4">
                      <Music className="h-7 w-7 text-indigo-500" />
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                        Birthday Playlist
                      </h2>
                      <Music className="h-7 w-7 text-pink-500" />
                    </div>
                    <p className="text-gray-600 text-lg">Celebrate with Varsha's favorite tunes</p>
                  </div>
                  <MusicPlayer />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Birthday Message Section */}
      <section className="relative px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-white/80 to-pink-50/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/20 to-indigo-100/30"></div>
            <CardContent className="relative pt-10 pb-10 px-6 sm:px-10">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center space-x-2 mb-4">
                    <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      A Special Message for Varsha
                    </h2>
                    <Heart className="h-6 w-6 text-purple-500 fill-purple-500" />
                  </div>
                </div>

                <div className="max-w-3xl mx-auto space-y-6 text-gray-700">
                  <p className="text-xl sm:text-2xl font-semibold text-pink-600">Dear Varsha,</p>

                  <div className="space-y-4 text-lg sm:text-xl leading-relaxed">
                    <p>
                      On your special day, i want to celebrate all the
                      <span className="font-semibold text-purple-600"> joy and happiness </span>
                      you bring to my lives. Your kindness, laughter, and friendship mean the world to me.
                    </p>

                    <p>
                      May this year bring you
                      <span className="font-semibold text-indigo-600"> endless adventures</span>,
                      <span className="font-semibold text-pink-600"> beautiful moments</span>, and
                      <span className="font-semibold text-purple-600"> all the success </span>
                      you deserve.
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      Happy Birthday! 🎉🎂🎁
                    </p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="flex items-center justify-center space-x-4 pt-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-500 animate-pulse" />
            <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Made with Love for Varsha's Birthday
            </p>
            <Heart className="h-5 w-5 text-purple-500 fill-purple-500 animate-pulse" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm">© {new Date().getFullYear()} | Celebrating Life, Love & Friendship</p>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}
