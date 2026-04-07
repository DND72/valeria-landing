/**
 * Modulo per l'invio di notifiche a Valeria tramite Telegram Bot API.
 */

interface TelegramConfig {
  botToken: string | undefined
  chatId: string | undefined
}

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const config: TelegramConfig = {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  }

  if (!config.botToken || !config.chatId) {
    console.warn('[Telegram] Configurazione mancante (TOKEN o CHAT_ID). Notifica non inviata.')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      console.error('[Telegram] Errore API:', errData)
      return false
    }

    return true
  } catch (e) {
    console.error('[Telegram] Errore invio:', e)
    return false
  }
}
