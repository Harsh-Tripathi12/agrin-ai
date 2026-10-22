import {
    getFarmer,
    getFarmsByFarmer,
} from "../services/farmerService.js";

import {
    getWeatherByLocation,
} from "../services/weatherService.js";

import {
    calculateFarmRisk,
} from "../services/riskService.js";


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