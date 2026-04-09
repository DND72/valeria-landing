/**
 * Telegram notification utility for Valeria Astrology Hub.
 * Sends real-time alerts to staff when premium requests arrive.
 *
 * Setup:
 *   1. Create a bot via @BotFather → copy the API token
 *   2. Get your Chat ID via @userinfobot
 *   3. Add to backend/.env:
 *        TELEGRAM_BOT_TOKEN=your_token
 *        TELEGRAM_CHAT_ID=your_chat_id
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID

export async function notifyStaff(message: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) return // Silent no-op if not configured

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    // Non-critical: log but never crash the main flow
    console.error('[Telegram] Failed to send notification:', err)
  }
}

// --- Pre-built message templates ---

export const tg = {
  newSynastry: (displayName: string) =>
    `🌹 <b>Nuovo Libro dell'Amore</b>\n\n` +
    `👤 Cliente: <b>${displayName}</b>\n` +
    `💰 Crediti scalati: <b>50 CR</b>\n\n` +
    `📋 Apri la Control Room per revisionare e pubblicare.`,

  newAdvancedChart: (displayName: string) =>
    `✨ <b>Nuovo Tema Natale Evolutivo</b>\n\n` +
    `👤 Cliente: <b>${displayName}</b>\n` +
    `💰 Crediti scalati: <b>30 CR</b>\n\n` +
    `📋 Apri la Control Room per revisionare e pubblicare.`,

  newMentore: (displayName: string) =>
    `🔮 <b>Nuova Richiesta Mentore Silente</b>\n\n` +
    `👤 Cliente: <b>${displayName}</b>\n\n` +
    `📋 L'utente attende il suo oroscopo personalizzato.`,

  refundIssued: (displayName: string, amount: number) =>
    `↩️ <b>Rimborso emesso</b>\n\n` +
    `👤 Cliente: <b>${displayName}</b>\n` +
    `💰 Importo: <b>${amount} CR</b>\n\n` +
    `ℹ️ Richiesta annullata dallo staff.`,

  criticalError: (endpoint: string, errMsg: string) =>
    `🚨 <b>Errore Critico</b>\n\n` +
    `📍 Endpoint: <code>${endpoint}</code>\n` +
    `❌ Errore: <code>${errMsg}</code>`,
}
