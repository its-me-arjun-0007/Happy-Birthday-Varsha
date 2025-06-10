interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramChat {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  date: number
  chat: TelegramChat
  text?: string
  photo?: Array<{
    file_id: string
    file_unique_id: string
    width: number
    height: number
    file_size?: number
  }>
  document?: {
    file_id: string
    file_unique_id: string
    file_name?: string
    mime_type?: string
    file_size?: number
  }
  voice?: {
    file_id: string
    file_unique_id: string
    duration: number
    mime_type?: string
    file_size?: number
  }
  video?: {
    file_id: string
    file_unique_id: string
    width: number
    height: number
    duration: number
    mime_type?: string
    file_size?: number
  }
  audio?: {
    file_id: string
    file_unique_id: string
    duration: number
    performer?: string
    title?: string
    mime_type?: string
    file_size?: number
  }
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  callback_query?: {
    id: string
    from: TelegramUser
    message?: TelegramMessage
    data?: string
  }
}

export class TelegramBot {
  private token: string
  private baseUrl: string

  constructor(token: string) {
    this.token = token
    this.baseUrl = `https://api.telegram.org/bot${token}`
  }

  async sendMessage(
    chatId: number,
    text: string,
    options?: {
      reply_to_message_id?: number
      parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
      reply_markup?: any
    },
  ) {
    const response = await fetch(`${this.baseUrl}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`)
    }

    return response.json()
  }

  async sendPhoto(
    chatId: number,
    photo: string,
    options?: {
      caption?: string
      reply_to_message_id?: number
      parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
    },
  ) {
    const response = await fetch(`${this.baseUrl}/sendPhoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        ...options,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send photo: ${response.statusText}`)
    }

    return response.json()
  }

  async getFile(fileId: string) {
    const response = await fetch(`${this.baseUrl}/getFile?file_id=${fileId}`)

    if (!response.ok) {
      throw new Error(`Failed to get file: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      ...data.result,
      url: `https://api.telegram.org/file/bot${this.token}/${data.result.file_path}`,
    }
  }

  async setWebhook(url: string, secretToken?: string) {
    const response = await fetch(`${this.baseUrl}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        secret_token: secretToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteWebhook() {
    const response = await fetch(`${this.baseUrl}/deleteWebhook`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.statusText}`)
    }

    return response.json()
  }

  async getMe() {
    const response = await fetch(`${this.baseUrl}/getMe`)

    if (!response.ok) {
      throw new Error(`Failed to get bot info: ${response.statusText}`)
    }

    return response.json()
  }
}
