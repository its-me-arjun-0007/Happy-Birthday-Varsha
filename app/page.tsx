import type { Metadata } from "next"
import Image from "next/image"
import { Cake, Gift, Music, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Confetti from "@/components/confetti"
import CountdownTimer from "@/components/countdown-timer"
import GuestbookForm from "@/components/guestbook-form"
import MusicPlayer from "@/components/music-player"
import PhotoGallery from "@/components/photo-gallery"
import { config } from "@/lib/config"

export const metadata: Metadata = {
  title: "Happy Birthday Varsha!",
  description: "A special birthday celebration for Varsha",
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 pb-20">
      <Confetti />

      {/* Header */}
      <header className="relative pt-16 pb-10 text-center">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-5 -left-0">
            <Image
              src="https://files.catbox.moe/yi8hi2.png?height=150&width=150"
              alt="Balloon decoration"
              width={145}
              height={145}
              className="opacity-70"
            />
          </div>
          <div className="absolute -top-5 right-0">
            <Image
              src="https://files.catbox.moe/a9bl7d.png?height=150&width=150"
              alt="Balloon decoration"
              width={150}
              height={150}
              className="opacity-70"
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-pink-600 mb-4 animate-bounce">Happy Birthday Varsha!</h1>
        <p className="text-xl md:text-2xl text-purple-700 max-w-2xl mx-auto px-4">
          Welcome to Varsha's special day celebration! Join us in making this birthday unforgettable!
        </p>
      </header>

      {/* Countdown Section */}
      <section className="max-w-4xl mx-auto mb-16 px-4">
        <Card className="border-4 border-pink-300 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-800 mb-6 flex items-center justify-center gap-2">
              <Cake className="h-6 w-6" /> Countdown to the Big Day <Cake className="h-6 w-6" />
            </h2>
            <CountdownTimer targetDate={config.birthdayDate} />
          </CardContent>
        </Card>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <Tabs defaultValue="gallery" className="mb-16">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="gallery" className="text-lg">
              Photo Gallery
            </TabsTrigger>
            <TabsTrigger value="wishes" className="text-lg">
              Birthday Wishes
            </TabsTrigger>
            <TabsTrigger value="music" className="text-lg">
              Birthday Playlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-0">
            <Card className="border-4 border-pink-300 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-800 mb-6 flex items-center justify-center gap-2">
                  <Gift className="h-6 w-6" /> Memories with Varsha <Gift className="h-6 w-6" />
                </h2>
                <PhotoGallery />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishes" className="mt-0">
            <Card className="border-4 border-pink-300 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-800 mb-6 flex items-center justify-center gap-2">
                  <Send className="h-6 w-6" /> Leave a Birthday Wish <Send className="h-6 w-6" />
                </h2>
                <GuestbookForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="music" className="mt-0">
            <Card className="border-4 border-pink-300 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-800 mb-6 flex items-center justify-center gap-2">
                  <Music className="h-6 w-6" /> Birthday Playlist <Music className="h-6 w-6" />
                </h2>
                <MusicPlayer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Birthday Message */}
      <section className="max-w-4xl mx-auto mb-16 px-4">
        <Card className="border-4 border-pink-300 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-purple-800 mb-6">
              A Special Message for Varsha
            </h2>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-lg">Dear Varsha,</p>
              <p className="text-lg">
                On your special day, we want to celebrate all the joy and happiness you bring to our lives. Your
                kindness, laughter, and friendship mean the world to us.
              </p>
              <p className="text-lg">
                May this year bring you endless adventures, beautiful moments, and all the success you deserve.
              </p>
              <p className="text-lg font-bold mt-4">Happy Birthday! 🎉🎂🎁</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="text-center text-purple-700 py-6">
        <p>Made with ❤️ for Varsha's Birthday</p>
        <p className="text-sm mt-2">© {new Date().getFullYear()} | All Rights Reserved</p>
      </footer>
    </main>
  )
}
