-- Create users table to store Telegram user information
CREATE TABLE IF NOT EXISTS telegram_users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  language_code VARCHAR(10),
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chats table to store chat information
CREATE TABLE IF NOT EXISTS telegram_chats (
  id BIGINT PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255),
  username VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table to log all messages
CREATE TABLE IF NOT EXISTS telegram_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  user_id BIGINT REFERENCES telegram_users(id),
  chat_id BIGINT REFERENCES telegram_chats(id),
  text TEXT,
  message_type VARCHAR(50) DEFAULT 'text',
  file_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bot_commands table to track command usage
CREATE TABLE IF NOT EXISTS bot_commands (
  id SERIAL PRIMARY KEY,
  command VARCHAR(100) NOT NULL,
  user_id BIGINT REFERENCES telegram_users(id),
  chat_id BIGINT REFERENCES telegram_chats(id),
  parameters TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_user_id ON telegram_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_commands_command ON bot_commands(command);
CREATE INDEX IF NOT EXISTS idx_bot_commands_user_id ON bot_commands(user_id);
