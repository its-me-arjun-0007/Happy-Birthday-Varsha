"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function GuestbookForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus("submitting")

    try {
      const response = await fetch("/api/send-birthday-wish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setFormStatus("success")
        toast({
          title: "Birthday wish sent!",
          description: "Your message has been sent to Varsha.",
          variant: "default",
        })

        setFormData({
          name: "",
          email: "",
          message: "",
        })
      } else {
        setFormStatus("error")
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      setFormStatus("error")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send your birthday wish. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {formStatus === "success" ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Birthday Wish Sent!</h3>
          <p className="text-green-700 mb-4">
            Your message has been delivered to Varsha. Thank you for your wonderful birthday wishes!
          </p>
          <Button
            onClick={() => setFormStatus("idle")}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            Send Another Wish
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-purple-700">
                Your Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border-pink-200 focus:border-pink-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-purple-700">
                Your Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="border-pink-200 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-purple-700">
              Birthday Message
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="Write your birthday wish for Varsha..."
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="min-h-[120px] border-pink-200 focus:border-pink-500"
            />
          </div>

          {formStatus === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">
                There was an error sending your message. Please try again or contact the site administrator.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-full w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Birthday Wish"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
