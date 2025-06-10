import { type NextRequest, NextResponse } from "next/server"
import { TelegramBot } from "@/lib/telegram"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)

export async function POST(request: NextRequest) {
  try {
    const { action, webhookUrl } = await request.json()

    switch (action) {
      case "setWebhook":
        if (!webhookUrl) {
          return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 })
        }

        const result = await bot.setWebhook(webhookUrl, process.env.TELEGRAM_SECRET_TOKEN)

        return NextResponse.json({
          success: true,
          message: "Webhook set successfully",
          result,
        })

      case "deleteWebhook":
        const deleteResult = await bot.deleteWebhook()
        return NextResponse.json({
          success: true,
          message: "Webhook deleted successfully",
          result: deleteResult,
        })

      case "getMe":
        const botInfo = await bot.getMe()
        return NextResponse.json({
          success: true,
          botInfo: botInfo.result,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Management API error:", error)
    return NextResponse.json(
      {
        error: "Failed to perform action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const botInfo = await bot.getMe()
    return NextResponse.json({
      success: true,
      bot: botInfo.result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get bot info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
