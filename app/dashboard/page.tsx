"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bot, Webhook, Trash2, Info } from "lucide-react"

interface BotInfo {
  id: number
  is_bot: boolean
  first_name: string
  username: string
  can_join_groups: boolean
  can_read_all_group_messages: boolean
  supports_inline_queries: boolean
}

export default function Dashboard() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchBotInfo()
    // Set default webhook URL
    setWebhookUrl(`${window.location.origin}/api/telegram/webhook`)
  }, [])

  const fetchBotInfo = async () => {
    try {
      const response = await fetch("/api/telegram/manage")
      const data = await response.json()
      if (data.success) {
        setBotInfo(data.bot)
      }
    } catch (error) {
      console.error("Failed to fetch bot info:", error)
    }
  }

  const handleAction = async (action: string) => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/telegram/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          webhookUrl: action === "setWebhook" ? webhookUrl : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        if (action === "getMe") {
          setBotInfo(data.botInfo)
        }
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to perform action: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Telegram Bot Dashboard</h1>
        <p className="text-muted-foreground">Manage your Telegram bot configuration and monitor its status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bot Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Bot Information
            </CardTitle>
            <CardDescription>Current bot configuration and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {botInfo ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Bot Name</Label>
                  <p className="text-sm text-muted-foreground">{botInfo.first_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-sm text-muted-foreground">@{botInfo.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bot ID</Label>
                  <p className="text-sm text-muted-foreground">{botInfo.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={botInfo.can_join_groups ? "default" : "secondary"}>
                    {botInfo.can_join_groups ? "Can Join Groups" : "No Groups"}
                  </Badge>
                  <Badge variant={botInfo.supports_inline_queries ? "default" : "secondary"}>
                    {botInfo.supports_inline_queries ? "Inline Queries" : "No Inline"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading bot information...</p>
            )}

            <Button onClick={() => handleAction("getMe")} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Info className="h-4 w-4 mr-2" />}
              Refresh Bot Info
            </Button>
          </CardContent>
        </Card>

        {/* Webhook Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Management
            </CardTitle>
            <CardDescription>Configure webhook URL for receiving updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/api/telegram/webhook"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleAction("setWebhook")} disabled={loading || !webhookUrl} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Webhook className="h-4 w-4 mr-2" />}
                Set Webhook
              </Button>

              <Button
                onClick={() => handleAction("deleteWebhook")}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      {message && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm">{message}</p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Environment Variables Required:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <code>TELEGRAM_BOT_TOKEN</code> - Your bot token from @BotFather
              </li>
              <li>
                <code>TELEGRAM_SECRET_TOKEN</code> - Optional secret for webhook security
              </li>
              <li>
                <code>DATABASE_URL</code> - Database connection string
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Available Bot Commands:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <code>/start</code> - Welcome message
              </li>
              <li>
                <code>/help</code> - Show available commands
              </li>
              <li>
                <code>/stats</code> - Show usage statistics
              </li>
              <li>
                <code>/echo &lt;text&gt;</code> - Echo message
              </li>
              <li>
                <code>/weather &lt;city&gt;</code> - Weather info (demo)
              </li>
              <li>
                <code>/joke</code> - Random joke
              </li>
              <li>
                <code>/info</code> - Chat information
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
