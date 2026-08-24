import { auth } from "../config/firebase.js";


const API_BASE_URL = "http://localhost:5000/api";


// ============================================
// AUTHENTICATION HEADER
// ============================================

async function getAuthHeaders() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in.");
    }

    const token = await user.getIdToken();

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}


// ============================================
// HEALTH CHECK
// ============================================

export async function checkApiHealth() {
    const response = await fetch(
        `${API_BASE_URL}/health`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Backend health check failed"
        );
    }

    return data;
}


// ============================================
// FARMER APIs
// ============================================

export async function createFarmer(farmerData) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_BASE_URL}/farmers`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(farmerData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create farmer"
        );
    }

    return data;
}


export async function getFarmer(farmerId) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_BASE_URL}/farmers/${farmerId}`,
        {
            method: "GET",
            headers,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to get farmer"
        );
    }

    return data;
}


export async function updateFarmer(
    farmerId,
    farmerData
) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_BASE_URL}/farmers/${farmerId}`,
        {
            method: "PUT",
            headers,
            body: JSON.stringify(farmerData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update farmer"
        );
    }

    return data;
}


// ============================================
// FARM APIs
// ============================================

export async function createFarm(farmData) {
    const headers = await getAuthHeaders();

    const { farmerId, ...rest } = farmData;

    const response = await fetch(
        `${API_BASE_URL}/farmers/${farmerId}/farms`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(rest),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create farm"
        );
    }

    return data;
}


export async function getFarms(farmerId) {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_BASE_URL}/farmers/${farmerId}/farms`,
        {
            method: "GET",
            headers,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to get farms"
        );
    }

    return data;
}


// ============================================
// WEATHER API
// ============================================

export async function getWeather(
    district,
    state
) {
    const params = new URLSearchParams({
        district,
        state,
    });

    const response = await fetch(
        `${API_BASE_URL}/weather?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch weather"
        );
    }

    return data;
}

// ============================================
// AI ASSISTANT
// ============================================

export async function askAssistant(
    question,
    language = "en"
) {

    const headers =
        await getAuthHeaders();


    const response =
        await fetch(
            `${API_BASE_URL}/ai/assistant`,
            {
                method: "POST",

                headers,

                body: JSON.stringify({
                    question,
                    language,
                }),

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Assistant request failed"
        );

    }


    return data;
}


// ============================================
// CROP DOCTOR
// ============================================

export async function analyzeCrop(
    imageBase64,
    mimeType,
    crop,
    language = "en"
) {

    const headers =
        await getAuthHeaders();


    const response =
        await fetch(
            `${API_BASE_URL}/ai/crop-doctor`,
            {
                method: "POST",

                headers,

                body: JSON.stringify({

                    image:
                        imageBase64,

                    mimeType,

                    crop,

                    language,

                }),

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Crop analysis failed"
        );

    }


    return data;
}


// ============================================
// RISK
// ============================================

export async function getFarmRisk() {

    const headers =
        await getAuthHeaders();


    const response =
        await fetch(
            `${API_BASE_URL}/risk`,
            {
                method: "GET",
                headers,
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Risk request failed"
        );

    }


    return data;
}


// ============================================
// REGENERATIVE ADVISOR
// ============================================

export async function getRegenerativeAdvice(
    language = "en"
) {

    const headers =
        await getAuthHeaders();


    const response =
        await fetch(
            `${API_BASE_URL}/ai/regenerative`,
            {
                method: "POST",

                headers,

                body: JSON.stringify({
                    language,
                }),

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Regenerative advice failed"
        );

    }


    return data;
}