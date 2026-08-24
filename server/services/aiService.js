import { GoogleGenAI } from "@google/genai";


const apiKey =
    process.env.GEMINI_API_KEY;


if (!apiKey) {
    console.warn(
        "WARNING: GEMINI_API_KEY is not configured."
    );
}


const ai = new GoogleGenAI({
    apiKey,
});


const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.5-flash-lite";


const AGRICULTURE_SYSTEM_PROMPT = `
You are AgriN, an agricultural intelligence assistant
for Indian farmers.

Your job is to provide practical, understandable,
safe agricultural guidance.

Important rules:

1. Prefer simple language.
2. Support English and Hindi.
3. Consider the farmer's actual crop, soil,
   irrigation, location and weather when provided.
4. Never claim certainty when the information
   is uncertain.
5. Do not invent pesticide doses.
6. For serious crop disease or chemical-use questions,
   recommend consulting a qualified agricultural
   expert/local agricultural officer.
7. Prefer practical low-cost actions.
8. Consider sustainable and regenerative farming
   practices where appropriate.
9. Never pretend to physically inspect a farm.
10. Clearly distinguish observation from diagnosis.
`;


function extractText(response) {

    if (response?.text) {
        return response.text;
    }


    const parts =
        response?.candidates?.[0]
            ?.content?.parts || [];


    return parts
        .filter(
            (part) =>
                typeof part.text === "string"
        )
        .map(
            (part) => part.text
        )
        .join("\n");
}


function cleanJson(text) {

    if (!text) {
        throw new Error(
            "AI returned an empty response."
        );
    }


    let cleaned =
        text.trim();


    if (
        cleaned.startsWith("```json")
    ) {
        cleaned =
            cleaned
                .replace(
                    /^```json/,
                    ""
                )
                .replace(
                    /```$/,
                    ""
                )
                .trim();
    }


    if (
        cleaned.startsWith("```")
    ) {
        cleaned =
            cleaned
                .replace(
                    /^```/,
                    ""
                )
                .replace(
                    /```$/,
                    ""
                )
                .trim();
    }


    return JSON.parse(cleaned);
}


// ============================================
// TEXT GENERATION
// ============================================

export async function generateText({
    prompt,
    language = "en",
}) {

    const languageInstruction =
        language === "hi"
            ? "Respond in Hindi. Use simple farmer-friendly Hindi."
            : "Respond in simple English.";


    const response =
        await ai.models.generateContent({

            model: MODEL,

            contents: [
                {
                    text:
                        AGRICULTURE_SYSTEM_PROMPT +
                        "\n\n" +
                        languageInstruction +
                        "\n\n" +
                        prompt,
                },
            ],

        });


    return extractText(
        response
    );
}


// ============================================
// FARMER ASSISTANT
// ============================================

export async function askFarmerAssistant({
    question,
    language,
    farmer,
    farm,
    weather,
}) {

    const prompt = `
Farmer question:
${question}

Farmer context:
${JSON.stringify(
    farmer || {},
    null,
    2
)}

Farm context:
${JSON.stringify(
    farm || {},
    null,
    2
)}

Current weather:
${JSON.stringify(
    weather || {},
    null,
    2
)}

Answer the farmer's question.

Give:
- direct answer
- practical steps
- warning if relevant
- when to seek expert help

Keep the response concise enough for a mobile farmer app.
`;


    return generateText({
        prompt,
        language,
    });
}


// ============================================
// CROP DOCTOR
// ============================================

export async function analyzeCropImage({
    imageBase64,
    mimeType,
    language,
    crop,
    farm,
}) {

    const prompt = `
Analyze this crop/plant image for the AgriN Crop Doctor.

Known crop:
${crop || "Unknown"}

Farm context:
${JSON.stringify(
    farm || {},
    null,
    2
)}

Return ONLY valid JSON in this exact structure:

{
  "possibleProblem": "string",
  "confidence": 0,
  "severity": "low | medium | high | unknown",
  "observations": ["string"],
  "symptoms": ["string"],
  "recommendedActions": ["string"],
  "prevention": ["string"],
  "urgency": "monitor | act_soon | urgent | unknown",
  "disclaimer": "string"
}

Rules:
- confidence must be between 0 and 100.
- Do not claim a certain diagnosis from one image.
- If the image quality is insufficient, say so.
- Avoid unsupported pesticide dosage.
- Mention professional/local agriculture advice when appropriate.
- ${language === "hi"
        ? "Write all values in simple Hindi."
        : "Write all values in simple English."}
`;


    const response =
        await ai.models.generateContent({

            model: MODEL,

            contents: [
                {
                    inlineData: {
                        mimeType,
                        data: imageBase64,
                    },
                },
                {
                    text:
                        AGRICULTURE_SYSTEM_PROMPT +
                        "\n\n" +
                        prompt,
                },
            ],

        });


    const text =
        extractText(
            response
        );


    return cleanJson(
        text
    );
}


// ============================================
// REGENERATIVE ADVISOR
// ============================================

export async function generateRegenerativeAdvice({
    language,
    farmer,
    farm,
    weather,
}) {

    const prompt = `
Create a regenerative agriculture improvement plan
for this farmer.

Farmer:
${JSON.stringify(
    farmer || {},
    null,
    2
)}

Farm:
${JSON.stringify(
    farm || {},
    null,
    2
)}

Weather:
${JSON.stringify(
    weather || {},
    null,
    2
)}

Return ONLY valid JSON:

{
  "summary": "string",
  "soilHealth": ["string"],
  "waterManagement": ["string"],
  "cropRotation": ["string"],
  "biodiversity": ["string"],
  "organicMatter": ["string"],
  "reducedDisturbance": ["string"],
  "priorityActions": [
    {
      "action": "string",
      "reason": "string",
      "difficulty": "easy | medium | hard"
    }
  ]
}

Use practical recommendations suitable for an Indian farmer.
`;

    const languageInstruction =
        language === "hi"
            ? "Write all values in simple Hindi."
            : "Write all values in simple English.";


    const response =
        await ai.models.generateContent({

            model: MODEL,

            contents: [
                {
                    text:
                        AGRICULTURE_SYSTEM_PROMPT +
                        "\n\n" +
                        languageInstruction +
                        "\n\n" +
                        prompt,
                },
            ],

        });


    const text =
        extractText(
            response
        );


    return cleanJson(
        text
    );
}


// ============================================
// ERROR HELPER
// ============================================

function getFriendlyAIError(error) {
    const status =
        error?.status ||
        error?.code ||
        error?.error?.status;

    if (
        status === 503 ||
        status === "UNAVAILABLE"
    ) {
        return new Error(
            "AgriN AI is temporarily busy. Please try again in a moment."
        );
    }

    if (
        status === 429 ||
        error?.error?.code === 429
    ) {
        return new Error(
            "AgriN AI has reached its current usage limit. Please try again later."
        );
    }

    return new Error(
        "AgriN AI could not process your request. Please try again."
    );
}