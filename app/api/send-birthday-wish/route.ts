import { NextResponse } from "next/server"
import { Resend } from "resend"
import { config } from "@/lib/config"
import BirthdayWishEmail from "@/emails/birthday-wish-email"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `Birthday Website <${config.emailSettings.fromEmail}>`,
      to: [config.recipientEmail],
      subject: `🎂 Birthday Wish from ${name}!`,
      react: BirthdayWishEmail({ name, email, message }),
      text: `Birthday Wish from ${name} (${email}): ${message}`, // Fallback plain text
    })

    if (error) {
      console.error("Resend API error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Birthday wish sent successfully!",
      id: data?.id,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
