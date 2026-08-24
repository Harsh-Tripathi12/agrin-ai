import {
    getWeatherByLocation
} from "../services/weatherService.js";


export async function getWeather(
    req,
    res
) {

    try {

        const {
            district,
            state
        } = req.query;


        if (!district || !state) {

            return res.status(400).json({
                success: false,
                message:
                    "District and state are required",
            });

        }


        const weather =
            await getWeatherByLocation(
                district,
                state
            );


        return res.json({

            success: true,

            data: weather,

        });

    } catch (error) {

        console.error(
            "Weather controller error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch weather",

        });

    }
}