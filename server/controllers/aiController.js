import {
    askFarmerAssistant,
    analyzeCropImage,
    generateRegenerativeAdvice,
} from "../services/aiService.js";

import {
    getFarmer,
    getFarmsByFarmer,
} from "../services/farmerService.js";

import {
    getWeatherByLocation,
} from "../services/weatherService.js";


async function getFarmContext(
    farmerId
) {

    const farmer =
        await getFarmer(
            farmerId
        );


    const farms =
        await getFarmsByFarmer(
            farmerId
        );


    const farm =
        farms[0] || null;


    let weather = null;


    const location =
        farm?.location ||
        farmer?.location;


    if (
        location?.district &&
        location?.state
    ) {

        try {

            weather =
                await getWeatherByLocation(
                    location.district,
                    location.state
                );

        } catch (error) {

            console.warn(
                "AI context weather failed:",
                error.message
            );

        }
    }


    return {
        farmer,
        farm,
        weather,
    };
}


// ============================================
// ASSISTANT
// ============================================

export async function assistant(
    req,
    res
) {

    try {

        const {
            question,
            language = "en",
        } = req.body;


        if (
            !question ||
            !question.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Question is required",

            });

        }


        const context =
            await getFarmContext(
                req.user.uid
            );


        const answer =
            await askFarmerAssistant({

                question,

                language,

                ...context,

            });


        return res.json({

            success: true,

            data: {
                answer,
            },

        });


    } catch (error) {

        console.error(
            "Assistant error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Assistant failed",

        });

    }
}


// ============================================
// CROP DOCTOR
// ============================================

export async function cropDoctor(
    req,
    res
) {

    try {

        const {
            image,
            mimeType,
            crop,
            language = "en",
        } = req.body;


        if (
            !image ||
            !mimeType
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Crop image is required",

            });

        }


        const context =
            await getFarmContext(
                req.user.uid
            );


        const result =
            await analyzeCropImage({

                imageBase64:
                    image,

                mimeType,

                crop,

                language,

                farm:
                    context.farm,

            });


        return res.json({

            success: true,

            data: result,

        });


    } catch (error) {

        console.error(
            "Crop Doctor error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Crop analysis failed",

        });

    }
}


// ============================================
// REGENERATIVE ADVISOR
// ============================================

export async function regenerative(
    req,
    res
) {

    try {

        const {
            language = "en",
        } = req.body;


        const context =
            await getFarmContext(
                req.user.uid
            );


        const result =
            await generateRegenerativeAdvice({

                language,

                ...context,

            });


        return res.json({

            success: true,

            data: result,

        });


    } catch (error) {

        console.error(
            "Regenerative Advisor error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Regenerative advice failed",

        });

    }
}