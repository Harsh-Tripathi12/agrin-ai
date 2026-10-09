/**
 * Telegram Notification Service
 * Sends automated agricultural risk alerts to farmers via Telegram Bot API.
 */

// Fallback or environment bot token
const getBotToken = (customToken) => {
    return customToken || process.env.TELEGRAM_BOT_TOKEN || "";
};

/**
 * Send an alert message to a Telegram Chat ID
 * @param {Object} options
 * @param {string} options.chatId - The recipient's Telegram chat ID or @channel
 * @param {string} options.text - The formatted alert text
 * @param {string} [options.parseMode='HTML'] - 'HTML' or 'Markdown'
 * @param {string} [options.botToken] - Optional custom bot token
 * @returns {Promise<{success: boolean, messageId?: number, error?: string}>}
 */
export async function sendTelegramMessage({ chatId, text, parseMode = "HTML", botToken }) {
    const token = getBotToken(botToken);

    if (!token) {
        throw new Error(
            "TELEGRAM_BOT_TOKEN is not configured in server environment. Please set TELEGRAM_BOT_TOKEN in .env or provide botToken."
        );
    }

    if (!chatId) {
        throw new Error("Telegram Chat ID is required to send automated alert.");
    }

    const cleanChatId = String(chatId).trim();
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
        chat_id: cleanChatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram API Error response:", data);
            let userFriendlyMsg = data.description || "Failed to deliver message via Telegram.";
            if (data.description?.includes("chat not found")) {
                userFriendlyMsg = "Telegram Chat ID not found. Make sure the farmer has started the bot by sending /start first.";
            } else if (data.description?.includes("bot was blocked")) {
                userFriendlyMsg = "The farmer has blocked the Telegram bot.";
            }
            throw new Error(userFriendlyMsg);
        }

        return {
            success: true,
            messageId: data.result?.message_id,
            chat: data.result?.chat,
        };
    } catch (err) {
        console.error("sendTelegramMessage error:", err.message);
        throw err;
    }
}

/**
 * Format risk alert for Telegram HTML styling
 */
export function formatTelegramRiskAlert({
    farmerName,
    farmName,
    location,
    overallRisk,
    risks = [],
    weather = null,
    language = "en",
}) {
    const isHindi = language === "hi";
    const current = weather?.current;

    const sevEmoji = overallRisk === "high" ? "🚨" : overallRisk === "medium" ? "⚠️" : "✅";
    const sevLabel = isHindi
        ? (overallRisk === "high" ? "उच्च (HIGH)" : overallRisk === "medium" ? "मध्यम (MEDIUM)" : "सामान्य (LOW)")
        : overallRisk.toUpperCase();

    let msg = "";

    if (isHindi) {
        msg += `🌾 <b>AgriN - स्वचालित खेत जोखिम अलर्ट</b> ${sevEmoji}\n\n`;
        msg += `👨‍🌾 <b>किसान:</b> ${farmerName || "किसान भाई"}\n`;
        msg += `🚜 <b>खेत:</b> ${farmName || "मेरा खेत"}\n`;
        if (location) msg += `📍 <b>स्थान:</b> ${location}\n`;
        msg += `⚡ <b>जोखिम स्तर:</b> <b>${sevLabel}</b>\n\n`;

        if (current) {
            msg += `🌦️ <b>मौसम की स्थिति:</b>\n`;
            msg += `• तापमान: ${current.temperature != null ? `${Math.round(current.temperature)}°C` : "--"}\n`;
            msg += `• मौसम: ${current.condition || "साफ़"}\n`;
            msg += `• आर्द्रता: ${current.humidity != null ? `${current.humidity}%` : "--"}\n`;
            msg += `• वर्षा: ${current.rain != null ? `${current.rain} mm` : "0 mm"}\n\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📋 <b>पहचाने गए खतरे और समाधान:</b>\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (risks.length === 0) {
            msg += `✅ वर्तमान में कोई बड़ा खतरा नहीं पाया गया।\n\n`;
        } else {
            risks.forEach((r, idx) => {
                const title = r.title_hi || r.title || "चेतावनी";
                const issue = r.message_hi || r.message || "";
                const action = r.action_hi || r.action || "";

                msg += `<b>${idx + 1}. ⚠️ खतरा: ${title}</b>\n`;
                if (issue) msg += `   • <i>समस्या:</i> ${issue}\n`;
                if (action) msg += `   • 🛡️ <b>समाधान:</b> ${action}\n\n`;
            });
        }

        msg += `🌱 <i>AgriN AI स्मार्ट कृषि सलाहकार - 24x7 स्वचालित सुरक्षा</i>`;
    } else {
        msg += `🌾 <b>AgriN - Automated Farm Risk Alert</b> ${sevEmoji}\n\n`;
        msg += `👨‍🌾 <b>Farmer:</b> ${farmerName || "Farmer"}\n`;
        msg += `🚜 <b>Farm:</b> ${farmName || "My Farm"}\n`;
        if (location) msg += `📍 <b>Location:</b> ${location}\n`;
        msg += `⚡ <b>Risk Level:</b> <b>${sevLabel}</b>\n\n`;

        if (current) {
            msg += `🌦️ <b>Live Weather Snapshot:</b>\n`;
            msg += `• Temp: ${current.temperature != null ? `${Math.round(current.temperature)}°C` : "--"}\n`;
            msg += `• Condition: ${current.condition || "Clear"}\n`;
            msg += `• Humidity: ${current.humidity != null ? `${current.humidity}%` : "--"}\n`;
            msg += `• Rain: ${current.rain != null ? `${current.rain} mm` : "0 mm"}\n\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📋 <b>IDENTIFIED THREATS & RESOLUTIONS:</b>\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (risks.length === 0) {
            msg += `✅ No severe risks identified at the moment.\n\n`;
        } else {
            risks.forEach((r, idx) => {
                const title = r.title || "Alert";
                const issue = r.message || "";
                const action = r.action || "";

                msg += `<b>${idx + 1}. ⚠️ Threat: ${title}</b>\n`;
                if (issue) msg += `   • <i>Issue:</i> ${issue}\n`;
                if (action) msg += `   • 🛡️ <b>Resolution:</b> ${action}\n\n`;
            });
        }

        msg += `🌱 <i>AgriN AI Smart Farming - 24x7 Automated Protection</i>`;
    }

    return msg;
}
