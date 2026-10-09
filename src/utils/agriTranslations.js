// Comprehensive Bilingual Agricultural Translation Helper for AgriN
// Translates soil types, irrigation, weather, crop diseases, units, and severities

export const SOIL_TRANSLATIONS = {
    alluvial: { en: "Alluvial Soil", hi: "जलोढ़ मिट्टी" },
    black: { en: "Black Soil", hi: "काली मिट्टी" },
    red: { en: "Red Soil", hi: "लाल मिट्टी" },
    sandy: { en: "Sandy Soil", hi: "बलुई मिट्टी" },
    loamy: { en: "Loamy Soil", hi: "दोमट मिट्टी" },
    clay: { en: "Clay Soil", hi: "चिकनी मिट्टी" },
    other: { en: "Other Soil", hi: "अन्य मिट्टी" },
};

export const IRRIGATION_TRANSLATIONS = {
    rainfed: { en: "Rainfed (Natural Rain)", hi: "वर्षा आधारित (प्राकृतिक बारिश)" },
    borewell: { en: "Borewell / Tubewell", hi: "बोरवेल / नलकूप" },
    canal: { en: "Canal", hi: "नहर" },
    drip: { en: "Drip Irrigation", hi: "ड्रिप (टपक) सिंचाई" },
    sprinkler: { en: "Sprinkler Irrigation", hi: "फव्वारा (स्प्रिंकलर) सिंचाई" },
    other: { en: "Other Source", hi: "अन्य सिंचाई साधन" },
};

export const LAND_UNIT_TRANSLATIONS = {
    acre: { en: "Acre", hi: "एकड़" },
    bigha: { en: "Bigha", hi: "बीघा" },
    hectare: { en: "Hectare", hi: "हेक्टेयर" },
    cent: { en: "Cent", hi: "सेंट" },
    guntha: { en: "Guntha", hi: "गुंठा" },
};

export const SEVERITY_TRANSLATIONS = {
    low: { en: "Low", hi: "कम" },
    medium: { en: "Medium", hi: "मध्यम" },
    high: { en: "High", hi: "अधिक" },
    urgent: { en: "Urgent", hi: "अति आवश्यक" },
    act_soon: { en: "Act Soon", hi: "शीघ्र उपचार करें" },
    monitor: { en: "Monitor", hi: "निगरानी रखें" },
    unknown: { en: "Unknown", hi: "अज्ञात" },
};

export const WEATHER_CONDITION_TRANSLATIONS = {
    "clear sky": { en: "Clear Sky", hi: "साफ आसमान" },
    "mainly clear": { en: "Mainly Clear", hi: "मुख्यतः साफ मौसम" },
    "partly cloudy": { en: "Partly Cloudy", hi: "आंशिक रूप से बादल" },
    "overcast": { en: "Overcast", hi: "घने बादल" },
    "fog": { en: "Fog", hi: "कोहरा / धुंध" },
    "depositing rime fog": { en: "Rime Fog", hi: "घना कोहरा" },
    "light drizzle": { en: "Light Drizzle", hi: "हल्की बूंदाबांदी" },
    "moderate drizzle": { en: "Moderate Drizzle", hi: "बूंदाबांदी" },
    "dense drizzle": { en: "Dense Drizzle", hi: "तेज बूंदाबांदी" },
    "slight rain": { en: "Slight Rain", hi: "हल्की बारिश" },
    "moderate rain": { en: "Moderate Rain", hi: "मध्यम बारिश" },
    "heavy rain": { en: "Heavy Rain", hi: "भारी बारिश" },
    "rain showers": { en: "Rain Showers", hi: "बारिश की बौछारें" },
    "thunderstorm": { en: "Thunderstorm", hi: "गरज के साथ बारिश" },
    "thunderstorm with hail": { en: "Thunderstorm with Hail", hi: "ओलावृष्टि के साथ आंधी" },
};

export const CROP_NAMES_TRANSLATIONS = {
    wheat: { en: "Wheat", hi: "गेहूं" },
    rice: { en: "Rice / Paddy", hi: "धान / चावल" },
    tomato: { en: "Tomato", hi: "टमाटर" },
    potato: { en: "Potato", hi: "आलू" },
    cotton: { en: "Cotton", hi: "कपास" },
    sugarcane: { en: "Sugarcane", hi: "गन्ना" },
    mustard: { en: "Mustard", hi: "सरसों" },
    maize: { en: "Maize (Corn)", hi: "मक्का" },
    soybean: { en: "Soybean", hi: "सोयाबीन" },
    onion: { en: "Onion", hi: "प्याज" },
    garlic: { en: "Garlic", hi: "लहसुन" },
    chilli: { en: "Chilli", hi: "मिर्च" },
    pulses: { en: "Pulses", hi: "दलहन" },
    gram: { en: "Gram (Chickpea)", hi: "चना" },
};

// Common crop disease and term translation dictionary for Crop Doctor
export const CROP_DISEASE_TRANSLATIONS = {
    "early blight": "अगेती झुलसा रोग (Early Blight)",
    "late blight": "पछेती झुलसा रोग (Late Blight)",
    "leaf blight": "पत्ती झुलसा रोग (Leaf Blight)",
    "powdery mildew": "चूर्णिल आसिता / सफेद फफूंद (Powdery Mildew)",
    "downy mildew": "मृदुरोमिल आसिता (Downy Mildew)",
    "leaf rust": "पत्ती का रतुआ / गेरुई रोग (Leaf Rust)",
    "wheat rust": "गेहूं का रतुआ रोग (Wheat Rust)",
    "bacterial blight": "जीवाणु झुलसा (Bacterial Blight)",
    "bacterial leaf spot": "जीवाणु पत्ती धब्बा रोग",
    "leaf curl": "पत्ती मरोड़ रोग (Leaf Curl)",
    "yellow vein mosaic": "पीला मोज़ेक रोग (Yellow Mosaic)",
    "anthracnose": "एंथ्रेक्नोज (श्याम वर्ण रोग)",
    "cercospora leaf spot": "टिक्का / सर्कोस्पोरा पत्ती धब्बा रोग",
    "healthy": "पौधा पूर्णतः स्वस्थ है (Healthy)",
    "healthy plant": "पौधा स्वस्थ है",
    "healthy rice leaf": "स्वस्थ धान की पत्ती",
    "nitrogen deficiency": "नाइट्रोजन की कमी (पीलापन)",
    "potassium deficiency": "पोटाश की कमी",
    "phosphorus deficiency": "फास्फोरस की कमी",
    "aphid infestation": "माहू / एफिड कीट का प्रकोप",
    "whitefly damage": "सफेद मक्खी का प्रकोप",
    "stem borer": "तना छेदक कीट (Stem Borer)",
};

// Common English-to-Hindi action advice translator
export const ACTION_ADVICE_TRANSLATIONS = [
    { en: /isolate affected leaves/i, hi: "रोगग्रस्त पत्तियों को तोड़कर खेत से दूर नष्ट करें।" },
    { en: /monitor moisture/i, hi: "खेत में नमी की नियमित निगरानी करें और जलभराव न होने दें।" },
    { en: /copper-based fungicide/i, hi: "कॉपर ऑक्सीक्लोराइड या उपयुक्त कवकनाशी (Fungicide) का छिड़काव करें।" },
    { en: /mancozeb/i, hi: "मैंकोज़ेब (Mancozeb 75% WP) 2-2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।" },
    { en: /neem oil/i, hi: "नीम का तेल (5 मिली प्रति लीटर) का जैविक छिड़काव करें।" },
    { en: /avoid overhead watering/i, hi: "पत्तियों के ऊपर से पानी देने से बचें, केवल जड़ों में सिंचाई करें।" },
    { en: /crop rotation/i, hi: "अगले मौसम में फसल चक्र (Crop Rotation) अपनाएं।" },
    { en: /certified seeds/i, hi: "केवल प्रमाणित एवं रोगमुक्त बीजों की ही बुवाई करें।" },
    { en: /balanced npk/i, hi: "संतुलित मात्रा में एनपीके (NPK) और जैविक खाद का प्रयोग करें।" },
    { en: /improve drainage/i, hi: "खेत से अतिरिक्त पानी की निकासी की उचित व्यवस्था करें।" },
    { en: /spray in evening/i, hi: "कीटनाशक या दवा का छिड़काव सुबह या शाम के समय ही करें।" },
    { en: /leaf discoloration noted/i, hi: "पत्तियों पर धब्बे और रंग में परिवर्तन देखा गया।" },
    { en: /yellow-brown spots/i, hi: "निचली पत्तियों पर पीले-भूरे रंग के धब्बे दिखाई दे रहे हैं।" },
    { en: /orange-brown pustules/i, hi: "पत्तियों पर नारंगी-भूरे रंग के पाउडर जैसे दाने दिख रहे हैं।" },
    { en: /uniform vibrant green/i, hi: "पत्ती एकसमान हरी और स्वस्थ है।" },
];

// Helper to translate any soil type
export function translateSoil(soil, isHindi) {
    if (!soil) return isHindi ? "निर्दिष्ट नहीं" : "Not specified";
    const key = soil.toLowerCase().trim();
    if (SOIL_TRANSLATIONS[key]) {
        return isHindi ? SOIL_TRANSLATIONS[key].hi : SOIL_TRANSLATIONS[key].en;
    }
    return soil;
}

// Helper to translate any irrigation type
export function translateIrrigation(irrigation, isHindi) {
    if (!irrigation) return isHindi ? "निर्दिष्ट नहीं" : "Not specified";
    const key = irrigation.toLowerCase().trim();
    if (IRRIGATION_TRANSLATIONS[key]) {
        return isHindi ? IRRIGATION_TRANSLATIONS[key].hi : IRRIGATION_TRANSLATIONS[key].en;
    }
    return irrigation;
}

// Helper to translate land unit
export function translateLandUnit(unit, isHindi) {
    if (!unit) return "";
    const key = unit.toLowerCase().trim();
    if (LAND_UNIT_TRANSLATIONS[key]) {
        return isHindi ? LAND_UNIT_TRANSLATIONS[key].hi : LAND_UNIT_TRANSLATIONS[key].en;
    }
    return unit;
}

// Helper to translate weather condition
export function translateWeatherCondition(condition, isHindi) {
    if (!condition) return isHindi ? "साफ मौसम" : "Clear";
    if (!isHindi) return condition;
    const condLower = condition.toLowerCase().trim();
    for (const [key, val] of Object.entries(WEATHER_CONDITION_TRANSLATIONS)) {
        if (condLower.includes(key)) {
            return val.hi;
        }
    }
    if (condLower.includes("rain") || condLower.includes("drizzle")) return "बारिश";
    if (condLower.includes("cloud")) return "बादल";
    if (condLower.includes("thunder")) return "तूफान व बिजली";
    if (condLower.includes("clear")) return "साफ आसमान";
    if (condLower.includes("fog") || condLower.includes("mist")) return "कोहरा";
    return condition;
}

// Helper to translate crop name
export function translateCropName(crop, isHindi) {
    if (!crop) return "";
    const key = crop.toLowerCase().trim();
    if (CROP_NAMES_TRANSLATIONS[key]) {
        return isHindi ? CROP_NAMES_TRANSLATIONS[key].hi : CROP_NAMES_TRANSLATIONS[key].en;
    }
    return crop;
}

// Helper to translate severity
export function translateSeverityText(severity, isHindi) {
    const key = (severity || "").toLowerCase().trim();
    if (SEVERITY_TRANSLATIONS[key]) {
        return isHindi ? SEVERITY_TRANSLATIONS[key].hi : SEVERITY_TRANSLATIONS[key].en;
    }
    return severity || (isHindi ? "अज्ञात" : "Unknown");
}

// Helper to translate crop disease diagnosis
export function translateCropDiagnosis(text, isHindi) {
    if (!text || !isHindi) return text;
    const lower = text.toLowerCase().trim();
    for (const [key, val] of Object.entries(CROP_DISEASE_TRANSLATIONS)) {
        if (lower.includes(key)) {
            return val;
        }
    }
    return text;
}

// Helper to translate agricultural action text
export function translateActionText(text, isHindi) {
    if (!text || !isHindi) return text;
    for (const item of ACTION_ADVICE_TRANSLATIONS) {
        if (item.en.test(text)) {
            return item.hi;
        }
    }
    return text;
}
