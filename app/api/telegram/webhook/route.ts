import { type NextRequest, NextResponse } from "next/server"
import { TelegramBot, type TelegramUpdate } from "@/lib/telegram"
import { MessageHandler } from "@/lib/message-handler"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)
const messageHandler = new MessageHandler(bot)

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Telegram (optional but recommended)
    const secretToken = request.headers.get("x-telegram-bot-api-secret-token")
    if (process.env.TELEGRAM_SECRET_TOKEN && secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const update: TelegramUpdate = await request.json()

    // Process the update
    await messageHandler.handleUpdate(update)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Telegram webhook endpoint is running",
    timestamp: new Date().toISOString(),
  })
}
