import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function saveUser(user: {
  id: number
  username?: string
  first_name: string
  last_name?: string
  language_code?: string
  is_bot?: boolean
}) {
  await sql`
    INSERT INTO telegram_users (id, username, first_name, last_name, language_code, is_bot)
    VALUES (${user.id}, ${user.username || null}, ${user.first_name}, ${user.last_name || null}, ${user.language_code || null}, ${user.is_bot || false})
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      language_code = EXCLUDED.language_code,
      updated_at = CURRENT_TIMESTAMP
  `
}

export async function saveChat(chat: {
  id: number
  type: string
  title?: string
  username?: string
}) {
  await sql`
    INSERT INTO telegram_chats (id, type, title, username)
    VALUES (${chat.id}, ${chat.type}, ${chat.title || null}, ${chat.username || null})
    ON CONFLICT (id) DO UPDATE SET
      type = EXCLUDED.type,
      title = EXCLUDED.title,
      username = EXCLUDED.username,
      updated_at = CURRENT_TIMESTAMP
  `
}

export async function saveMessage(message: {
  message_id: number
  user_id?: number
  chat_id: number
  text?: string
  message_type?: string
  file_id?: string
}) {
  await sql`
    INSERT INTO telegram_messages (message_id, user_id, chat_id, text, message_type, file_id)
    VALUES (${message.message_id}, ${message.user_id || null}, ${message.chat_id}, ${message.text || null}, ${message.message_type || "text"}, ${message.file_id || null})
  `
}

export async function saveCommand(command: {
  command: string
  user_id?: number
  chat_id: number
  parameters?: string
}) {
  await sql`
    INSERT INTO bot_commands (command, user_id, chat_id, parameters)
    VALUES (${command.command}, ${command.user_id || null}, ${command.chat_id}, ${command.parameters || null})
  `
}

export async function getUserStats(userId: number) {
  const result = await sql`
    SELECT 
      COUNT(*) as message_count,
      COUNT(DISTINCT chat_id) as chat_count
    FROM telegram_messages 
    WHERE user_id = ${userId}
  `
  return result[0]
}

export async function getChatStats(chatId: number) {
  const result = await sql`
    SELECT 
      COUNT(*) as message_count,
      COUNT(DISTINCT user_id) as user_count
    FROM telegram_messages 
    WHERE chat_id = ${chatId}
  `
  return result[0]
}
