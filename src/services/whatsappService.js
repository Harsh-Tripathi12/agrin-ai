// WhatsApp Alert Service for AgriN Smart Farming
// Generates beautifully formatted, bilingual (Hindi & English) risk and resolution alerts

export function formatWhatsAppRiskMessage({
    farmer,
    farm,
    risk,
    weather,
    language = "en"
}) {
    const isHindi = language === "hi";

    const farmerName = farmer?.name || (isHindi ? "किसान भाई" : "Farmer");
    const farmName = farm?.farmName || (isHindi ? "मेरा खेत" : "My Farm");
    const district = farm?.location?.district || farmer?.location?.district || weather?.location?.district || "";
    const state = farm?.location?.state || farmer?.location?.state || weather?.location?.state || "";
    const locationStr = [district, state].filter(Boolean).join(", ");

    const overallSeverity = (risk?.overallRisk || "medium").toLowerCase();
    const severityHindi = 
        overallSeverity === "high" ? "अधिक (HIGH)" :
        overallSeverity === "medium" ? "मध्यम (MEDIUM)" : "कम (LOW)";

    const risksList = Array.isArray(risk?.risks) ? risk.risks : [];

    const now = new Date();
    const dateStr = now.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const currentTemp = weather?.current?.temperature != null ? Math.round(weather.current.temperature) : "--";
    const humidity = weather?.current?.humidity != null ? weather.current.humidity : "--";
    const rainProb = weather?.forecast?.[0]?.rainProbability != null ? weather.forecast[0].rainProbability : 0;

    if (isHindi) {
        let msg = `🌾 *AgriN स्मार्ट कृषि - आपातकालीन खेत चेतावनी* ⚠️\n\n`;
        msg += `👨‍🌾 *किसान:* ${farmerName}\n`;
        msg += `🚜 *खेत:* ${farmName}${locationStr ? ` (${locationStr})` : ""}\n`;
        msg += `🚨 *कुल जोखिम स्तर:* *${severityHindi}*\n`;
        msg += `📅 *दिनांक व समय:* ${dateStr}, ${timeStr}\n\n`;

        msg += `══════════════════════════\n`;
        msg += `📋 *पहचाने गए खतरे और समाधान*\n`;
        msg += `══════════════════════════\n\n`;

        if (risksList.length === 0) {
            msg += `✅ *सब सुरक्षित है!*\nआपके खेत के लिए फिलहाल कोई गंभीर खतरा नहीं पाया गया है।\n\n`;
        } else {
            risksList.forEach((r, idx) => {
                const title = r.title_hi || r.title || `जोखिम #${idx + 1}`;
                const sev = (r.severity || "medium").toLowerCase() === "high" ? "अत्यधिक (High)" :
                            (r.severity || "medium").toLowerCase() === "medium" ? "मध्यम (Medium)" : "सामान्य (Low)";
                const problem = r.message_hi || r.message || "";
                const action = r.action_hi || r.action || "";

                msg += `*${idx + 1}. ⚠️ खतरा:* *${title}*\n`;
                msg += `   • *गंभीरता:* ${sev}\n`;
                if (problem) msg += `   • *समस्या:* ${problem}\n`;
                if (action) {
                    msg += `   • *🛡️ कैसे हल करें (समाधान):*\n`;
                    msg += `     👉 ${action}\n`;
                }
                msg += `\n`;
            });
        }

        msg += `══════════════════════════\n`;
        msg += `🌤️ *मौसम अपडेट:*\n`;
        msg += `तापमान: ${currentTemp}°C | नमी: ${humidity}% | बारिश की संभावना: ${rainProb}%\n\n`;
        msg += `🌱 _AgriN AI कृषि सलाहकार - सदैव आपकी सेवा में_\n`;
        msg += `🌐 https://agrin-ai-frontend.onrender.com`;

        return msg;
    } else {
        let msg = `🌾 *AgriN Smart Farming - Crop Risk Alert* ⚠️\n\n`;
        msg += `👨‍🌾 *Farmer:* ${farmerName}\n`;
        msg += `🚜 *Farm:* ${farmName}${locationStr ? ` (${locationStr})` : ""}\n`;
        msg += `🚨 *Overall Risk Level:* *${overallSeverity.toUpperCase()}*\n`;
        msg += `📅 *Date & Time:* ${dateStr}, ${timeStr}\n\n`;

        msg += `══════════════════════════\n`;
        msg += `📋 *IDENTIFIED RISKS & HOW TO RESOLVE*\n`;
        msg += `══════════════════════════\n\n`;

        if (risksList.length === 0) {
            msg += `✅ *All Clear!*\nNo major threats detected for your farm right now.\n\n`;
        } else {
            risksList.forEach((r, idx) => {
                const title = r.title || `Risk #${idx + 1}`;
                const sev = (r.severity || "medium").toUpperCase();
                const problem = r.message || "";
                const action = r.action || "";

                msg += `*${idx + 1}. ⚠️ Threat:* *${title}*\n`;
                msg += `   • *Severity:* ${sev}\n`;
                if (problem) msg += `   • *Issue:* ${problem}\n`;
                if (action) {
                    msg += `   • *🛡️ Action Required:*\n`;
                    msg += `     👉 ${action}\n`;
                }
                msg += `\n`;
            });
        }

        msg += `══════════════════════════\n`;
        msg += `🌤️ *Weather Context:*\n`;
        msg += `Temp: ${currentTemp}°C | Humidity: ${humidity}% | Rain Probability: ${rainProb}%\n\n`;
        msg += `🌱 _AgriN AI Agriculture Assistant - Protecting your harvest._\n`;
        msg += `🌐 https://agrin-ai-frontend.onrender.com`;

        return msg;
    }
}

export function cleanWhatsAppNumber(phone) {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    // If Indian 10-digit number without country code, prepend 91
    if (cleaned.length === 10) {
        cleaned = "91" + cleaned;
    }
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, "");
    return cleaned;
}

export function getWhatsAppUrl(phone, message) {
    const cleanPhone = cleanWhatsAppNumber(phone);
    const encoded = encodeURIComponent(message);
    if (cleanPhone) {
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    }
    return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function sendWhatsAppRiskAlert({
    phoneNumber,
    farmer,
    farm,
    risk,
    weather,
    language = "en"
}) {
    const message = formatWhatsAppRiskMessage({
        farmer,
        farm,
        risk,
        weather,
        language
    });

    const targetPhone = phoneNumber || farmer?.phone || farm?.phone || "";
    const url = getWhatsAppUrl(targetPhone, message);

    // Open WhatsApp in new tab/app window
    if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
    }

    return {
        success: true,
        message,
        url,
        phone: targetPhone
    };
}
