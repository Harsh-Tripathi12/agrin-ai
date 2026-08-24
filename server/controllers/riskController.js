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


        const weather =
            await getWeatherByLocation(
                location.district,
                location.state
            );


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