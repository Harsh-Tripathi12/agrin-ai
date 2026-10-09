import {
    getFarmer,
    getFarmsByFarmer,
    updateFarmer,
} from "../services/farmerService.js";

import {
    getWeatherByLocation,
} from "../services/weatherService.js";

import {
    calculateFarmRisk,
} from "../services/riskService.js";

import {
    sendTelegramMessage,
    formatTelegramRiskAlert,
} from "../services/telegramService.js";


export async function getFarmRisk(
    req,
    res
) {

    try {

        const farmerId =
            req.user.uid;


        let farmer = null;
        try {
            farmer = await getFarmer(farmerId);
        } catch (err) {
            console.warn("Farmer doc not found for risk calculation:", err.message);
        }


        const farms =
            await getFarmsByFarmer(
                farmerId
            );


        const farm =
            farms[0] || null;


        if (!farm) {

            return res.status(404).json({

                success: false,

                message:
                    "No farm found",

            });

        }


        const location =
            farm.location ||
            farmer.location;


        if (
            !location?.district ||
            !location?.state
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Farm location is incomplete",

            });

        }


        let weather = null;
        try {
            weather = await getWeatherByLocation(
                location.district,
                location.state
            );
        } catch (wErr) {
            console.warn("Weather could not be fetched for risk calculation:", wErr.message);
        }

        const risk =
            calculateFarmRisk({
                farm,
                weather,
            });


        return res.json({

            success: true,

            data: {
                ...risk,
                weather,
            },

        });


    } catch (error) {

        console.error(
            "Risk error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Risk calculation failed",

        });

    }
}

export async function sendWhatsAppRiskAlert(req, res) {
    try {
        const farmerId = req.user.uid;
        const { language = "en", phone } = req.body;

        let farmer = null;
        try {
            farmer = await getFarmer(farmerId);
        } catch { /* ignore */ }

        const farms = await getFarmsByFarmer(farmerId);
        const farm = farms[0] || null;

        const location = farm?.location || farmer?.location;
        let weather = null;
        if (location?.district && location?.state) {
            try {
                weather = await getWeatherByLocation(location.district, location.state);
            } catch { /* ignore */ }
        }

        const riskData = calculateFarmRisk({ farm, weather });

        const targetPhone = phone || farmer?.phone || "";
        const isHindi = language === "hi";

        let alertText = "";
        const farmerName = farmer?.name || (isHindi ? "किसान भाई" : "Farmer");
        const farmName = farm?.farmName || (isHindi ? "मेरा खेत" : "My Farm");
        const sevText = isHindi 
            ? (riskData.overallRisk === "high" ? "अधिक (HIGH)" : riskData.overallRisk === "medium" ? "मध्यम (MEDIUM)" : "सामान्य (LOW)")
            : (riskData.overallRisk.toUpperCase());

        if (isHindi) {
            alertText = `🌾 *AgriN स्मार्ट कृषि - आपातकालीन खेत चेतावनी* ⚠️\n\n`;
            alertText += `👨‍🌾 *किसान:* ${farmerName}\n`;
            alertText += `🚜 *खेत:* ${farmName}\n`;
            alertText += `🚨 *कुल जोखिम स्तर:* *${sevText}*\n\n`;
            alertText += `══════════════════════════\n`;
            alertText += `📋 *पहचाने गए खतरे और समाधान:*\n`;
            alertText += `══════════════════════════\n\n`;

            (riskData.risks || []).forEach((r, idx) => {
                alertText += `*${idx + 1}. ⚠️ खतरा:* *${r.title_hi || r.title}*\n`;
                if (r.message_hi || r.message) alertText += `   • *समस्या:* ${r.message_hi || r.message}\n`;
                if (r.action_hi || r.action) alertText += `   • *🛡️ समाधान:* ${r.action_hi || r.action}\n\n`;
            });

            alertText += `🌱 _AgriN AI कृषि सलाहकार - सदैव आपकी सेवा में_`;
        } else {
            alertText = `🌾 *AgriN Smart Farming - Risk Alert* ⚠️\n\n`;
            alertText += `👨‍🌾 *Farmer:* ${farmerName}\n`;
            alertText += `🚜 *Farm:* ${farmName}\n`;
            alertText += `🚨 *Overall Risk Level:* *${sevText}*\n\n`;
            alertText += `══════════════════════════\n`;
            alertText += `📋 *IDENTIFIED RISKS & HOW TO RESOLVE:*\n`;
            alertText += `══════════════════════════\n\n`;

            (riskData.risks || []).forEach((r, idx) => {
                alertText += `*${idx + 1}. ⚠️ Threat:* *${r.title}*\n`;
                if (r.message) alertText += `   • *Issue:* ${r.message}\n`;
                if (r.action) alertText += `   • *🛡️ Action:* ${r.action}\n\n`;
            });

            alertText += `🌱 _AgriN AI Agriculture Assistant - Protecting your harvest_`;
        }

        let cleanPhone = (targetPhone || "").replace(/[^0-9]/g, "");
        if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
        const waUrl = cleanPhone 
            ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(alertText)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(alertText)}`;

        return res.json({
            success: true,
            data: {
                message: alertText,
                whatsappUrl: waUrl,
                phone: targetPhone,
                overallRisk: riskData.overallRisk,
                risksCount: riskData.risks?.length || 0,
            }
        });
    } catch (err) {
        console.error("WhatsApp alert generation error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to generate WhatsApp alert"
        });
    }
}

export async function sendTelegramRiskAlert(req, res) {
    try {
        const farmerId = req.user.uid;
        const { language = "en", chatId, botToken } = req.body;

        let farmer = null;
        try {
            farmer = await getFarmer(farmerId);
        } catch { /* ignore */ }

        const farms = await getFarmsByFarmer(farmerId);
        const farm = farms[0] || null;

        const location = farm?.location || farmer?.location;
        let weather = null;
        if (location?.district && location?.state) {
            try {
                weather = await getWeatherByLocation(location.district, location.state);
            } catch { /* ignore */ }
        }

        const riskData = calculateFarmRisk({ farm, weather });

        const targetChatId = chatId || farmer?.telegramChatId || process.env.TELEGRAM_DEFAULT_CHAT_ID || "";
        if (!targetChatId) {
            return res.status(400).json({
                success: false,
                message: language === "hi" 
                    ? "टेलीग्राम चैट आईडी आवश्यक है। कृपया अपनी टेलीग्राम चैट आईडी दर्ज करें।" 
                    : "Telegram Chat ID is required. Please provide your Telegram chat ID."
            });
        }

        const formattedText = formatTelegramRiskAlert({
            farmerName: farmer?.name,
            farmName: farm?.farmName,
            location: location ? `${location.district || ""}, ${location.state || ""}` : "",
            overallRisk: riskData.overallRisk,
            risks: riskData.risks,
            weather: weather,
            language: language,
        });

        const telegramRes = await sendTelegramMessage({
            chatId: targetChatId,
            text: formattedText,
            parseMode: "HTML",
            botToken: botToken,
        });

        // Save telegramChatId to profile if newly supplied
        if (chatId && farmer && farmer.telegramChatId !== chatId) {
            try {
                await updateFarmer(farmerId, { telegramChatId: chatId });
            } catch (err) {
                console.warn("Could not save telegramChatId to profile:", err.message);
            }
        }

        return res.json({
            success: true,
            data: {
                message: formattedText,
                chatId: targetChatId,
                telegramResult: telegramRes,
                overallRisk: riskData.overallRisk,
            }
        });
    } catch (err) {
        console.error("Telegram alert error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to deliver automated Telegram alert"
        });
    }
}