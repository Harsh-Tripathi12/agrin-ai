/**
 * Frontend Telegram Alert Service
 * Handles automated Telegram notifications for farm risks in Hindi and English.
 */

export const DEFAULT_TELEGRAM_BOT_TOKEN = "8803340240:AAGO1L63IKJayibOL0m5KhAtRFGedvMCXzw";
export const TELEGRAM_BOT_USERNAME = "AgrinAlertBot";

export function cleanTelegramChatId(input) {
    if (!input) return "";
    return String(input).trim();
}

/**
 * Send direct Telegram message using official Bot API
 */
export async function sendDirectTelegramMessage({
    chatId,
    text,
    parseMode = "HTML",
    botToken = DEFAULT_TELEGRAM_BOT_TOKEN,
    language = "en",
}) {
    const cleanId = cleanTelegramChatId(chatId);
    if (!cleanId) {
        throw new Error(language === "hi" ? "चैट आईडी आवश्यक है।" : "Chat ID is required.");
    }

    const token = botToken || DEFAULT_TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: cleanId,
            text,
            parse_mode: parseMode,
            disable_web_page_preview: true,
        }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
        const desc = data.description || "";
        if (desc.includes("chat not found")) {
            throw new Error(
                language === "hi"
                    ? "टेलीग्राम चैट नहीं मिली! कृपया पहले टेलीग्राम पर @AgrinAlertBot खोलें और 'Start' दबाएं।"
                    : "Chat not found! Please open @AgrinAlertBot on Telegram and tap 'Start' first."
            );
        }
        if (desc.includes("bot was blocked")) {
            throw new Error(
                language === "hi"
                    ? "बॉट ब्लॉक है। कृपया टेलीग्राम पर @AgrinAlertBot को अनब्लॉक करें।"
                    : "Bot is blocked. Please unblock @AgrinAlertBot in Telegram."
            );
        }
        throw new Error(desc || (language === "hi" ? "टेलीग्राम संदेश भेजने में विफल।" : "Failed to deliver Telegram message."));
    }

    return data;
}

/**
 * Format Telegram message with HTML formatting
 */
export function formatTelegramRiskMessage({
    farmerName = "",
    farmName = "",
    location = "",
    overallRisk = "low",
    risks = [],
    weather = null,
    language = "en",
}) {
    const isHindi = language === "hi";
    const current = weather?.current;

    const sevEmoji = overallRisk === "high" ? "🚨" : overallRisk === "medium" ? "⚠️" : "✅";
    const sevLabel = isHindi
        ? (overallRisk === "high" ? "उच्च (HIGH)" : overallRisk === "medium" ? "मध्यम (MEDIUM)" : "सामान्य (LOW)")
        : (overallRisk || "low").toUpperCase();

    let msg = "";

    if (isHindi) {
        msg += `🌾 <b>AgriN - स्वचालित खेत जोखिम चेतावनी</b> ${sevEmoji}\n\n`;
        msg += `👨‍🌾 <b>किसान:</b> ${farmerName || "किसान भाई"}\n`;
        msg += `🚜 <b>खेत:</b> ${farmName || "मेरा खेत"}\n`;
        if (location) msg += `📍 <b>स्थान:</b> ${location}\n`;
        msg += `⚡ <b>जोखिम स्तर:</b> <b>${sevLabel}</b>\n\n`;

        if (current) {
            msg += `🌦️ <b>लाइव मौसम:</b>\n`;
            msg += `• तापमान: ${current.temperature != null ? `${Math.round(current.temperature)}°C` : "--"}\n`;
            msg += `• स्थिति: ${current.condition || "साफ़"}\n`;
            msg += `• आर्द्रता: ${current.humidity != null ? `${current.humidity}%` : "--"}\n`;
            msg += `• वर्षा: ${current.rain != null ? `${current.rain} mm` : "0 mm"}\n\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `📋 <b>पहचाने गए खतरे और तुरंत उपाय:</b>\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (!risks || risks.length === 0) {
            msg += `✅ वर्तमान में कोई बड़ा खतरा नहीं पाया गया। खेत की स्थिति सुरक्षित है।\n\n`;
        } else {
            risks.forEach((r, idx) => {
                const title = r.title_hi || r.title || "चेतावनी";
                const issue = r.message_hi || r.message || "";
                const action = r.action_hi || r.action || "";

                msg += `<b>${idx + 1}. ⚠️ ${title}</b>\n`;
                if (issue) msg += `   • <i>समस्या:</i> ${issue}\n`;
                if (action) msg += `   • 🛡️ <b>समाधान:</b> ${action}\n\n`;
            });
        }

        msg += `🌱 <i>AgriN AI स्मार्ट कृषि सलाहकार - 24x7 स्वचालित टेलीग्राम सुरक्षा</i>`;
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
        msg += `📋 <b>IDENTIFIED RISKS & HOW TO RESOLVE:</b>\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (!risks || risks.length === 0) {
            msg += `✅ No major threats detected right now. Farm is safe.\n\n`;
        } else {
            risks.forEach((r, idx) => {
                const title = r.title || "Alert";
                const issue = r.message || "";
                const action = r.action || "";

                msg += `<b>${idx + 1}. ⚠️ ${title}</b>\n`;
                if (issue) msg += `   • <i>Issue:</i> ${issue}\n`;
                if (action) msg += `   • 🛡️ <b>Action:</b> ${action}\n\n`;
            });
        }

        msg += `🌱 <i>AgriN AI Smart Farming - 24x7 Automated Telegram Protection</i>`;
    }

    return msg;
}
