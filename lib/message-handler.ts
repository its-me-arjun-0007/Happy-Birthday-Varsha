import type { TelegramBot, TelegramUpdate } from "./telegram"
import { saveUser, saveChat, saveMessage, saveCommand, getUserStats, getChatStats } from "./database"

export class MessageHandler {
  private bot: TelegramBot

  constructor(bot: TelegramBot) {
    this.bot = bot
  }

  async handleUpdate(update: TelegramUpdate) {
    try {
      if (update.message) {
        await this.handleMessage(update.message)
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query)
      }
    } catch (error) {
      console.error("Error handling update:", error)
    }
  }

  private async handleMessage(message: any) {
    // Save user and chat info
    if (message.from) {
      await saveUser(message.from)
    }
    await saveChat(message.chat)

    // Determine message type and save message
    let messageType = "text"
    let fileId = null

    if (message.photo) {
      messageType = "photo"
      fileId = message.photo[message.photo.length - 1].file_id
    } else if (message.document) {
      messageType = "document"
      fileId = message.document.file_id
    } else if (message.voice) {
      messageType = "voice"
      fileId = message.voice.file_id
    } else if (message.video) {
      messageType = "video"
      fileId = message.video.file_id
    } else if (message.audio) {
      messageType = "audio"
      fileId = message.audio.file_id
    }

    await saveMessage({
      message_id: message.message_id,
      user_id: message.from?.id,
      chat_id: message.chat.id,
      text: message.text,
      message_type: messageType,
      file_id: fileId,
    })

    // Handle commands
    if (message.text?.startsWith("/")) {
      await this.handleCommand(message)
    } else {
      await this.handleRegularMessage(message)
    }
  }

  private async handleCommand(message: any) {
    const text = message.text
    const [command, ...params] = text.split(" ")
    const parameters = params.join(" ")

    // Save command usage
    await saveCommand({
      command: command.substring(1), // Remove the '/' prefix
      user_id: message.from?.id,
      chat_id: message.chat.id,
      parameters: parameters || null,
    })

    switch (command) {
      case "/start":
        await this.handleStartCommand(message)
        break
      case "/help":
        await this.handleHelpCommand(message)
        break
      case "/stats":
        await this.handleStatsCommand(message)
        break
      case "/echo":
        await this.handleEchoCommand(message, parameters)
        break
      case "/weather":
        await this.handleWeatherCommand(message, parameters)
        break
      case "/joke":
        await this.handleJokeCommand(message)
        break
      case "/info":
        await this.handleInfoCommand(message)
        break
      default:
        await this.handleUnknownCommand(message, command)
    }
  }

  private async handleStartCommand(message: any) {
    const welcomeText = `
🤖 Welcome to the Bot!

I'm here to help you with various tasks. Here are some things I can do:

• /help - Show available commands
• /stats - Show your usage statistics
• /echo <text> - Echo your message
• /weather <city> - Get weather information
• /joke - Get a random joke
• /info - Get information about this chat

Feel free to send me messages, photos, documents, or voice messages!
    `.trim()

    await this.bot.sendMessage(message.chat.id, welcomeText)
  }

  private async handleHelpCommand(message: any) {
    const helpText = `
📋 Available Commands:

/start - Start the bot and see welcome message
/help - Show this help message
/stats - Show your usage statistics
/echo <text> - Echo your message back
/weather <city> - Get weather information (demo)
/joke - Get a random joke
/info - Get information about this chat

🔧 Features:
• Send me photos and I'll analyze them
• Send me documents and I'll process them
• Send me voice messages for transcription
• I log all interactions for analytics

Need more help? Just ask!
    `.trim()

    await this.bot.sendMessage(message.chat.id, helpText)
  }

  private async handleStatsCommand(message: any) {
    try {
      const userStats = await getUserStats(message.from.id)
      const chatStats = await getChatStats(message.chat.id)

      const statsText = `
📊 Statistics:

👤 Your Stats:
• Messages sent: ${userStats.message_count}
• Chats participated: ${userStats.chat_count}

💬 This Chat Stats:
• Total messages: ${chatStats.message_count}
• Active users: ${chatStats.user_count}
      `.trim()

      await this.bot.sendMessage(message.chat.id, statsText)
    } catch (error) {
      await this.bot.sendMessage(message.chat.id, "Sorry, I couldn't retrieve statistics at the moment.")
    }
  }

  private async handleEchoCommand(message: any, parameters: string) {
    if (!parameters) {
      await this.bot.sendMessage(message.chat.id, "Please provide text to echo. Usage: /echo <your text>")
      return
    }

    await this.bot.sendMessage(message.chat.id, `🔄 Echo: ${parameters}`)
  }

  private async handleWeatherCommand(message: any, parameters: string) {
    if (!parameters) {
      await this.bot.sendMessage(message.chat.id, "Please provide a city name. Usage: /weather <city>")
      return
    }

    // This is a demo response - you can integrate with a real weather API
    const weatherText = `
🌤️ Weather in ${parameters}:

Temperature: 22°C
Condition: Partly Cloudy
Humidity: 65%
Wind: 10 km/h

Note: This is a demo response. Integrate with a real weather API for actual data.
    `.trim()

    await this.bot.sendMessage(message.chat.id, weatherText)
  }

  private async handleJokeCommand(message: any) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What do you call a fake noodle? An impasta!",
      "Why did the math book look so sad? Because it had too many problems!",
    ]

    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
    await this.bot.sendMessage(message.chat.id, `😄 ${randomJoke}`)
  }

  private async handleInfoCommand(message: any) {
    const chat = message.chat
    const user = message.from

    const infoText = `
ℹ️ Chat Information:

💬 Chat Details:
• ID: ${chat.id}
• Type: ${chat.type}
• Title: ${chat.title || "N/A"}
• Username: ${chat.username || "N/A"}

👤 Your Details:
• ID: ${user.id}
• Name: ${user.first_name} ${user.last_name || ""}
• Username: @${user.username || "N/A"}
• Language: ${user.language_code || "N/A"}
    `.trim()

    await this.bot.sendMessage(message.chat.id, infoText)
  }

  private async handleUnknownCommand(message: any, command: string) {
    await this.bot.sendMessage(
      message.chat.id,
      `❓ Unknown command: ${command}\n\nUse /help to see available commands.`,
    )
  }

  private async handleRegularMessage(message: any) {
    if (message.photo) {
      await this.handlePhotoMessage(message)
    } else if (message.document) {
      await this.handleDocumentMessage(message)
    } else if (message.voice) {
      await this.handleVoiceMessage(message)
    } else if (message.video) {
      await this.handleVideoMessage(message)
    } else if (message.text) {
      await this.handleTextMessage(message)
    }
  }

  private async handlePhotoMessage(message: any) {
    await this.bot.sendMessage(message.chat.id, "📸 Nice photo! I received your image and saved it to the database.", {
      reply_to_message_id: message.message_id,
    })
  }

  private async handleDocumentMessage(message: any) {
    const doc = message.document
    await this.bot.sendMessage(
      message.chat.id,
      `📄 Document received: ${doc.file_name || "Unknown"}\nSize: ${doc.file_size ? Math.round(doc.file_size / 1024) + " KB" : "Unknown"}`,
      { reply_to_message_id: message.message_id },
    )
  }

  private async handleVoiceMessage(message: any) {
    const voice = message.voice
    await this.bot.sendMessage(
      message.chat.id,
      `🎤 Voice message received!\nDuration: ${voice.duration} seconds\n\nNote: Voice transcription can be added here.`,
      { reply_to_message_id: message.message_id },
    )
  }

  private async handleVideoMessage(message: any) {
    const video = message.video
    await this.bot.sendMessage(
      message.chat.id,
      `🎥 Video received!\nDuration: ${video.duration} seconds\nSize: ${video.file_size ? Math.round(video.file_size / 1024) + " KB" : "Unknown"}`,
      { reply_to_message_id: message.message_id },
    )
  }

  private async handleTextMessage(message: any) {
    // Simple echo for regular text messages
    await this.bot.sendMessage(
      message.chat.id,
      `💬 You said: "${message.text}"\n\nTip: Use /help to see available commands!`,
      { reply_to_message_id: message.message_id },
    )
  }

  private async handleCallbackQuery(callbackQuery: any) {
    // Handle inline keyboard button presses
    const data = callbackQuery.data
    const message = callbackQuery.message

    // You can add custom callback handling here
    await this.bot.sendMessage(message.chat.id, `Button pressed: ${data}`)
  }
}
